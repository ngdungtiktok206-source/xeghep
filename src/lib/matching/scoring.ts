import { DriverRoute, MatchCandidate, MatchingWeights, PassengerRequest } from '../../types';
import { PricingEngine } from '../pricing/pricingEngine';
import { calculatePreferenceMatch, calculateRouteCompatibility } from './routeCompatibility';

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  detourWeight: 0.40,
  fillRateWeight: 0.30,
  costWeight: 0.20,
  preferenceWeight: 0.10,
  corridorWidthKm: 2.0,
  maxAllowedDetourKm: 12.0,
};

/**
 * Calculates total match score and generates human-readable explanations
 */
export function evaluateCandidate(
  driverRoute: DriverRoute,
  passengerRequest: PassengerRequest,
  weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS
): MatchCandidate {
  const compat = calculateRouteCompatibility(driverRoute, passengerRequest, weights);

  const initialOccupied = driverRoute.occupiedSeats;
  const newOccupied = Math.min(driverRoute.vehicle.totalSeats, initialOccupied + passengerRequest.seats);
  const initialFillRate = Number(((initialOccupied / driverRoute.vehicle.totalSeats) * 100).toFixed(1));
  const projectedFillRate = Number(((newOccupied / driverRoute.vehicle.totalSeats) * 100).toFixed(1));

  // Pricing calculation
  const pricing = PricingEngine.calculateQuote(passengerRequest);

  // Preference match
  const preferenceMatch = calculatePreferenceMatch(driverRoute.vehicle.features, passengerRequest.preferences);

  // Cost efficiency: higher fill rate + price discount = higher cost efficiency
  const costEfficiency = Math.min(
    100,
    Math.round((projectedFillRate * 0.5 + pricing.savedPercentage * 0.8))
  );

  // If not feasible, return candidate with score 0
  if (!compat.feasibility.isFeasible) {
    return {
      driverRoute,
      passengerRequest,
      isFeasible: false,
      rejectionReason: compat.feasibility.rejectionReason,
      routeCompatibility: 0,
      routeOverlap: 0,
      directionSimilarity: compat.directionSimilarity,
      detourKm: compat.detourKm,
      detourMinutes: compat.detourMinutes,
      normalizedDetour: 1.0,
      initialOccupiedSeats: initialOccupied,
      newOccupiedSeats: newOccupied,
      initialFillRate,
      projectedFillRate,
      costEfficiency: 0,
      preferenceMatch,
      totalScore: 0,
      pricing,
      explanationPoints: [`Không phù hợp: ${compat.feasibility.rejectionReason}`],
      optimizedWaypoints: driverRoute.waypoints,
      optimizedPath: driverRoute.pathCoordinates,
    };
  }

  // Calculate Weighted Score
  // Detour component: (1 - normalizedDetour) scaled to 100
  const detourScore = Math.max(0, (1 - compat.normalizedDetour) * 100);
  const fillRateScore = projectedFillRate; // 0 to 100
  const costScore = costEfficiency;       // 0 to 100
  const prefScore = preferenceMatch;       // 0 to 100

  const rawScore =
    weights.detourWeight * detourScore +
    weights.fillRateWeight * fillRateScore +
    weights.costWeight * costScore +
    weights.preferenceWeight * prefScore;

  const totalScore = Number(Math.min(99.5, Math.max(10, rawScore)).toFixed(1));

  // Generate clear explanations for the user
  const explanations: string[] = [];
  explanations.push(
    `Tuyến khách nằm trên hành lang tuyến xe (${compat.routeOverlap}% trùng khớp, hướng khớp ${(compat.directionSimilarity * 100).toFixed(0)}%)`
  );
  explanations.push(
    compat.detourKm <= 1.5
      ? `Độ lệch tuyến cực thấp: chỉ phát sinh thêm ${compat.detourKm} km (~${compat.detourMinutes} phút)`
      : `Độ lệch tuyến hợp lý: phát sinh thêm ${compat.detourKm} km (~${compat.detourMinutes} phút đón/trả)`
  );
  explanations.push(
    `Tỷ lệ lấp đầy xe tối ưu: tăng từ ${initialOccupied}/${driverRoute.vehicle.totalSeats} (${initialFillRate}%) lên ${newOccupied}/${driverRoute.vehicle.totalSeats} (${projectedFillRate}%)`
  );
  explanations.push(
    `Tiết kiệm chi phí: rẻ hơn ${pricing.savedPercentage}% so với thuê xe riêng nguyên chuyến`
  );
  if (preferenceMatch >= 90) {
    explanations.push('Đầy đủ tiện ích phù hợp yêu cầu (Xe sạch, điều hòa êm, lái xe chuẩn mực)');
  }

  return {
    driverRoute,
    passengerRequest,
    isFeasible: true,
    routeCompatibility: compat.routeCompatibility,
    routeOverlap: compat.routeOverlap,
    directionSimilarity: compat.directionSimilarity,
    detourKm: compat.detourKm,
    detourMinutes: compat.detourMinutes,
    normalizedDetour: compat.normalizedDetour,
    initialOccupiedSeats: initialOccupied,
    newOccupiedSeats: newOccupied,
    initialFillRate,
    projectedFillRate,
    costEfficiency,
    preferenceMatch,
    totalScore,
    pricing,
    explanationPoints: explanations,
    optimizedWaypoints: compat.optimizedWaypoints,
    optimizedPath: compat.optimizedPath,
  };
}
