import { Coordinates } from '../../types';

export const EARTH_RADIUS_KM = 6371;

/**
 * Calculates Great Circle distance between two coordinates in km using Haversine formula
 */
export function calculateHaversineDistance(c1: Coordinates, c2: Coordinates): number {
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const lat1 = (c1.lat * Math.PI) / 180;
  const lat2 = (c2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((EARTH_RADIUS_KM * c).toFixed(2));
}

/**
 * Calculates total polyline length in km
 */
export function calculatePathLength(path: Coordinates[]): number {
  if (path.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    total += calculateHaversineDistance(path[i], path[i + 1]);
  }
  return Number(total.toFixed(2));
}

/**
 * Calculates the shortest perpendicular distance (km) from a point to a line segment [p1, p2]
 */
export function distanceToSegment(point: Coordinates, p1: Coordinates, p2: Coordinates): {
  distanceKm: number;
  closestPoint: Coordinates;
  projectionFactor: number;
} {
  const d12 = calculateHaversineDistance(p1, p2);
  if (d12 === 0) {
    return {
      distanceKm: calculateHaversineDistance(point, p1),
      closestPoint: p1,
      projectionFactor: 0,
    };
  }

  // Linear projection approximation for small geographic areas
  const dx = p2.lng - p1.lng;
  const dy = p2.lat - p1.lat;
  const t = Math.max(0, Math.min(1, ((point.lng - p1.lng) * dx + (point.lat - p1.lat) * dy) / (dx * dx + dy * dy)));

  const closestPoint: Coordinates = {
    lat: p1.lat + t * dy,
    lng: p1.lng + t * dx,
  };

  return {
    distanceKm: calculateHaversineDistance(point, closestPoint),
    closestPoint,
    projectionFactor: t,
  };
}

/**
 * Finds the minimum distance from a point to a whole polyline path (Corridor check)
 */
export function distanceToPolyline(point: Coordinates, path: Coordinates[]): {
  minDistanceKm: number;
  closestSegmentIndex: number;
  closestPoint: Coordinates;
  normalizedProgress: number; // 0.0 to 1.0 along the route
} {
  if (path.length === 0) {
    return { minDistanceKm: Infinity, closestSegmentIndex: -1, closestPoint: point, normalizedProgress: 0 };
  }
  if (path.length === 1) {
    return {
      minDistanceKm: calculateHaversineDistance(point, path[0]),
      closestSegmentIndex: 0,
      closestPoint: path[0],
      normalizedProgress: 0,
    };
  }

  let minDistanceKm = Infinity;
  let closestSegmentIndex = 0;
  let closestPoint = path[0];
  let segmentDistances: number[] = [];
  let totalLength = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const segmentLength = calculateHaversineDistance(path[i], path[i + 1]);
    segmentDistances.push(segmentLength);
    totalLength += segmentLength;

    const res = distanceToSegment(point, path[i], path[i + 1]);
    if (res.distanceKm < minDistanceKm) {
      minDistanceKm = res.distanceKm;
      closestSegmentIndex = i;
      closestPoint = res.closestPoint;
    }
  }

  // Calculate approximate normalized progress along the route (0.0 to 1.0)
  let traversedLength = 0;
  for (let i = 0; i < closestSegmentIndex; i++) {
    traversedLength += segmentDistances[i];
  }
  traversedLength += calculateHaversineDistance(path[closestSegmentIndex], closestPoint);
  const normalizedProgress = totalLength > 0 ? Math.min(1, Math.max(0, traversedLength / totalLength)) : 0;

  return {
    minDistanceKm: Number(minDistanceKm.toFixed(2)),
    closestSegmentIndex,
    closestPoint,
    normalizedProgress: Number(normalizedProgress.toFixed(3)),
  };
}

/**
 * Calculates bearing (angle 0-360) from origin to destination
 */
export function calculateBearing(start: Coordinates, end: Coordinates): number {
  const startLat = (start.lat * Math.PI) / 180;
  const startLng = (start.lng * Math.PI) / 180;
  const endLat = (end.lat * Math.PI) / 180;
  const endLng = (end.lng * Math.PI) / 180;

  const dLng = endLng - startLng;
  const y = Math.sin(dLng) * Math.cos(endLat);
  const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;
  return brng;
}

/**
 * Direction similarity score between two vectors (returns 0 to 1.0)
 * 1.0 = exactly same direction, 0.0 = opposite direction or perpendicular > 90deg
 */
export function calculateDirectionSimilarity(
  vec1Start: Coordinates,
  vec1End: Coordinates,
  vec2Start: Coordinates,
  vec2End: Coordinates
): number {
  const bearing1 = calculateBearing(vec1Start, vec1End);
  const bearing2 = calculateBearing(vec2Start, vec2End);

  let diff = Math.abs(bearing1 - bearing2);
  if (diff > 180) diff = 360 - diff;

  // Cosine-like falloff: 0 deg diff -> 1.0, 90 deg diff -> 0.0, >90 deg diff -> 0.0
  if (diff >= 90) return 0;
  const rad = (diff * Math.PI) / 180;
  return Number(Math.cos(rad).toFixed(3));
}

/**
 * Interpolates points along a polyline for smooth map drawing
 */
export function interpolatePolyline(path: Coordinates[], stepsPerSegment = 5): Coordinates[] {
  if (path.length < 2) return path;
  const result: Coordinates[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    result.push(p1);
    for (let s = 1; s < stepsPerSegment; s++) {
      const t = s / stepsPerSegment;
      result.push({
        lat: p1.lat + (p2.lat - p1.lat) * t,
        lng: p1.lng + (p2.lng - p1.lng) * t,
      });
    }
  }
  result.push(path[path.length - 1]);
  return result;
}
