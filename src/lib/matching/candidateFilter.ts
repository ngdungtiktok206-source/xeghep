import { DriverRoute, MatchingWeights, PassengerRequest } from '../../types';
import { calculateDirectionSimilarity, distanceToPolyline } from '../routing/geometry';

export type FeasibilityCheckResult = {
  isFeasible: boolean;
  rejectionReason?: string;
  directionSimilarity: number;
  originCorridorDistanceKm: number;
  destCorridorDistanceKm: number;
  timeGapMinutes: number;
};

/**
 * Checks if two departure windows overlap or are within acceptable margin
 */
export function checkTimeCompatibility(
  driverWindow: { start: string; end: string; date: string },
  passengerWindow: { start: string; end: string; date: string },
  maxToleranceMinutes = 45
): { isCompatible: boolean; timeGapMinutes: number } {
  // If dates don't match, not compatible
  if (driverWindow.date !== passengerWindow.date) {
    return { isCompatible: false, timeGapMinutes: 1440 };
  }

  const parseTimeToMinutes = (t: string): number => {
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const dStart = parseTimeToMinutes(driverWindow.start);
  const dEnd = parseTimeToMinutes(driverWindow.end);
  const pStart = parseTimeToMinutes(passengerWindow.start);
  const pEnd = parseTimeToMinutes(passengerWindow.end);

  // Check overlap: [dStart, dEnd] and [pStart, pEnd]
  const overlapStart = Math.max(dStart, pStart);
  const overlapEnd = Math.min(dEnd, pEnd);

  if (overlapStart <= overlapEnd) {
    return { isCompatible: true, timeGapMinutes: 0 };
  }

  // Calculate shortest gap between windows
  const gap = overlapStart - overlapEnd;
  const isCompatible = gap <= maxToleranceMinutes;

  return { isCompatible, timeGapMinutes: gap };
}

/**
 * Candidate Filtering: Rejects infeasible pairs before scoring
 */
export function checkCandidateFeasibility(
  driverRoute: DriverRoute,
  passengerRequest: PassengerRequest,
  weights: MatchingWeights
): FeasibilityCheckResult {
  // 1. Capacity constraint
  if (passengerRequest.rideType === 'private') {
    if (driverRoute.occupiedSeats > 0) {
      return {
        isFeasible: false,
        rejectionReason: 'Xe đã có khách ghép, không thể bao nguyên xe',
        directionSimilarity: 0,
        originCorridorDistanceKm: 0,
        destCorridorDistanceKm: 0,
        timeGapMinutes: 0,
      };
    }
  } else {
    if (driverRoute.availableSeats < passengerRequest.seats) {
      return {
        isFeasible: false,
        rejectionReason: `Không đủ ghế trống (Cần ${passengerRequest.seats} ghế, chỉ còn ${driverRoute.availableSeats} ghế)`,
        directionSimilarity: 0,
        originCorridorDistanceKm: 0,
        destCorridorDistanceKm: 0,
        timeGapMinutes: 0,
      };
    }
  }

  // 2. Time Window compatibility
  const timeCheck = checkTimeCompatibility(driverRoute.departureWindow, passengerRequest.departureWindow);
  if (!timeCheck.isCompatible) {
    return {
      isFeasible: false,
      rejectionReason: `Khung giờ không khớp (Lệch ${timeCheck.timeGapMinutes} phút so với giờ xuất phát của tài xế)`,
      directionSimilarity: 0,
      originCorridorDistanceKm: 0,
      destCorridorDistanceKm: 0,
      timeGapMinutes: timeCheck.timeGapMinutes,
    };
  }

  // 3. Direction similarity constraint
  const directionSim = calculateDirectionSimilarity(
    driverRoute.origin.coords,
    driverRoute.destination.coords,
    passengerRequest.origin.coords,
    passengerRequest.destination.coords
  );

  if (directionSim < 0.45) {
    return {
      isFeasible: false,
      rejectionReason: `Sai hướng di chuyển (Tài xế đi ${driverRoute.destination.province}, khách đi ${passengerRequest.destination.province})`,
      directionSimilarity: directionSim,
      originCorridorDistanceKm: 0,
      destCorridorDistanceKm: 0,
      timeGapMinutes: timeCheck.timeGapMinutes,
    };
  }

  // 4. Corridor spatial check
  const originDist = distanceToPolyline(passengerRequest.origin.coords, driverRoute.pathCoordinates);
  const destDist = distanceToPolyline(passengerRequest.destination.coords, driverRoute.pathCoordinates);

  // Check if passenger points are outside max corridor allowance
  const corridorLimit = Math.max(weights.corridorWidthKm * 2.5, 6.0);
  if (originDist.minDistanceKm > corridorLimit || destDist.minDistanceKm > corridorLimit) {
    return {
      isFeasible: false,
      rejectionReason: `Điểm đón/trả nằm ngoài hành lang tuyến xe (Lệch điểm đón ${originDist.minDistanceKm}km, điểm trả ${destDist.minDistanceKm}km)`,
      directionSimilarity: directionSim,
      originCorridorDistanceKm: originDist.minDistanceKm,
      destCorridorDistanceKm: destDist.minDistanceKm,
      timeGapMinutes: timeCheck.timeGapMinutes,
    };
  }

  // 5. Sequence constraint (Pickup must occur BEFORE dropoff along the driver's route)
  if (originDist.normalizedProgress > destDist.normalizedProgress + 0.05) {
    return {
      isFeasible: false,
      rejectionReason: 'Điểm trả khách nằm ngược chiều so với điểm đón trên lộ trình',
      directionSimilarity: directionSim,
      originCorridorDistanceKm: originDist.minDistanceKm,
      destCorridorDistanceKm: destDist.minDistanceKm,
      timeGapMinutes: timeCheck.timeGapMinutes,
    };
  }

  return {
    isFeasible: true,
    directionSimilarity: directionSim,
    originCorridorDistanceKm: originDist.minDistanceKm,
    destCorridorDistanceKm: destDist.minDistanceKm,
    timeGapMinutes: timeCheck.timeGapMinutes,
  };
}
