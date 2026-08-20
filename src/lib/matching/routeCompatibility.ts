import { Coordinates, DriverRoute, MatchingWeights, PassengerPreferences, PassengerRequest, Waypoint } from '../../types';
import { calculateHaversineDistance, calculatePathLength, distanceToPolyline } from '../routing/geometry';
import { checkCandidateFeasibility, FeasibilityCheckResult } from './candidateFilter';

export type RouteCompatibilityResult = {
  feasibility: FeasibilityCheckResult;
  routeCompatibility: number;     // 0 - 100%
  routeOverlap: number;            // 0 - 100%
  directionSimilarity: number;     // 0 - 1.0
  detourKm: number;               // extra km
  detourMinutes: number;          // extra minutes
  normalizedDetour: number;       // 0 - 1.0
  optimizedWaypoints: Waypoint[];
  optimizedPath: Coordinates[];
};

/**
 * Calculates route compatibility and detour for passenger-driver pair
 */
export function calculateRouteCompatibility(
  driverRoute: DriverRoute,
  passengerRequest: PassengerRequest,
  weights: MatchingWeights
): RouteCompatibilityResult {
  const feasibility = checkCandidateFeasibility(driverRoute, passengerRequest, weights);
  if (!feasibility.isFeasible) {
    return {
      feasibility,
      routeCompatibility: 0,
      routeOverlap: 0,
      directionSimilarity: feasibility.directionSimilarity,
      detourKm: 999,
      detourMinutes: 999,
      normalizedDetour: 1.0,
      optimizedWaypoints: driverRoute.waypoints,
      optimizedPath: driverRoute.pathCoordinates,
    };
  }

  // 1. Calculate corridor distances for Pickup and Dropoff
  const originDist = distanceToPolyline(passengerRequest.origin.coords, driverRoute.pathCoordinates);
  const destDist = distanceToPolyline(passengerRequest.destination.coords, driverRoute.pathCoordinates);

  // Detour is approximated by perpendicular distance in and out + connection penalty
  const detourKm = Number((originDist.minDistanceKm * 1.6 + destDist.minDistanceKm * 1.6).toFixed(1));
  const detourMinutes = Math.round((detourKm / 35) * 60 + 3);

  // Normalized detour (0.0 = 0 km detour, 1.0 = max allowed detour)
  const normalizedDetour = Math.min(1.0, Math.max(0, detourKm / weights.maxAllowedDetourKm));

  // 2. Route Overlap calculation
  // Overlap is the span of normalized progress between pickup and dropoff along the driver's route
  const progressSpan = Math.max(0.1, destDist.normalizedProgress - originDist.normalizedProgress);
  const routeOverlap = Math.min(100, Math.round(progressSpan * 100));

  // 3. Route compatibility score (combining overlap, corridor proximity and direction)
  const corridorCloseness = Math.max(0, 1 - (originDist.minDistanceKm + destDist.minDistanceKm) / (weights.corridorWidthKm * 4));
  const routeCompatibility = Math.min(
    100,
    Math.round(
      (feasibility.directionSimilarity * 0.4 + corridorCloseness * 0.35 + (routeOverlap / 100) * 0.25) * 100
    )
  );

  // 4. Construct optimized waypoints
  const pickupWp: Waypoint = {
    id: `wp-pickup-${passengerRequest.id}`,
    name: passengerRequest.origin.name,
    coords: passengerRequest.origin.coords,
    type: 'pickup',
    passengerId: passengerRequest.id,
    passengerName: passengerRequest.passengerName,
    order: 1,
  };

  const dropoffWp: Waypoint = {
    id: `wp-dropoff-${passengerRequest.id}`,
    name: passengerRequest.destination.name,
    coords: passengerRequest.destination.coords,
    type: 'dropoff',
    passengerId: passengerRequest.id,
    passengerName: passengerRequest.passengerName,
    order: 2,
  };

  const optimizedWaypoints: Waypoint[] = [
    { ...driverRoute.waypoints[0], order: 0 },
    pickupWp,
    dropoffWp,
    { ...driverRoute.waypoints[driverRoute.waypoints.length - 1], order: 3 },
  ];

  // 5. Construct visually rich detour path
  const origPath = driverRoute.pathCoordinates;
  const insertIdx1 = Math.max(1, originDist.closestSegmentIndex);
  const insertIdx2 = Math.min(origPath.length - 2, Math.max(insertIdx1 + 1, destDist.closestSegmentIndex));

  const optimizedPath: Coordinates[] = [
    ...origPath.slice(0, insertIdx1),
    passengerRequest.origin.coords,
    ...origPath.slice(insertIdx1, insertIdx2),
    passengerRequest.destination.coords,
    ...origPath.slice(insertIdx2),
  ];

  return {
    feasibility,
    routeCompatibility,
    routeOverlap,
    directionSimilarity: feasibility.directionSimilarity,
    detourKm,
    detourMinutes,
    normalizedDetour,
    optimizedWaypoints,
    optimizedPath,
  };
}

/**
 * Calculates preference match percentage (0 - 100%)
 */
export function calculatePreferenceMatch(
  vehicleFeatures: string[],
  preferences?: PassengerPreferences
): number {
  if (!preferences) return 100;
  let checks = 0;
  let matches = 0;

  if (preferences.noSmoking !== undefined) {
    checks++;
    if (vehicleFeatures.includes('Không hút thuốc') || preferences.noSmoking) matches++;
  }
  if (preferences.quietRide !== undefined) {
    checks++;
    if (vehicleFeatures.includes('Không gian yên tĩnh') || !preferences.quietRide) matches++;
  }
  if (preferences.petFriendly !== undefined) {
    checks++;
    if (vehicleFeatures.includes('Cho phép thú cưng') || !preferences.petFriendly) matches++;
  }
  if (preferences.largeTrunk !== undefined) {
    checks++;
    if (vehicleFeatures.includes('Cốp rộng') || !preferences.largeTrunk) matches++;
  }

  if (checks === 0) return 95;
  return Math.round((matches / checks) * 100);
}
