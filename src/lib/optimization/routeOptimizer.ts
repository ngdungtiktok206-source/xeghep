import { Coordinates, DriverRoute, PassengerRequest, Waypoint } from '../../types';
import { calculateHaversineDistance, calculatePathLength, interpolatePolyline } from '../routing/geometry';

export interface IOptimizationProvider {
  optimizeMultiStopRoute(
    driverRoute: DriverRoute,
    matchedPassengers: PassengerRequest[]
  ): Promise<{
    optimizedWaypoints: Waypoint[];
    totalDistanceKm: number;
    detourKm: number;
    optimizedPath: Coordinates[];
  }>;
}

export class DemoOptimizationProvider implements IOptimizationProvider {
  async optimizeMultiStopRoute(
    driverRoute: DriverRoute,
    matchedPassengers: PassengerRequest[]
  ): Promise<{
    optimizedWaypoints: Waypoint[];
    totalDistanceKm: number;
    detourKm: number;
    optimizedPath: Coordinates[];
  }> {
    const startPoint = driverRoute.origin.coords;
    const endPoint = driverRoute.destination.coords;

    // Collect all pickups and dropoffs
    type StopItem = {
      type: 'pickup' | 'dropoff';
      passenger: PassengerRequest;
      coords: Coordinates;
      name: string;
      distFromOrigin: number;
    };

    const stops: StopItem[] = [];
    for (const p of matchedPassengers) {
      stops.push({
        type: 'pickup',
        passenger: p,
        coords: p.origin.coords,
        name: p.origin.name,
        distFromOrigin: calculateHaversineDistance(startPoint, p.origin.coords),
      });
      stops.push({
        type: 'dropoff',
        passenger: p,
        coords: p.destination.coords,
        name: p.destination.name,
        distFromOrigin: calculateHaversineDistance(startPoint, p.destination.coords),
      });
    }

    // Topological sorting along travel direction from start to end
    stops.sort((a, b) => a.distFromOrigin - b.distFromOrigin);

    const waypoints: Waypoint[] = [
      {
        id: `origin-${driverRoute.id}`,
        name: driverRoute.origin.name,
        coords: startPoint,
        type: 'origin',
        order: 0,
      },
    ];

    stops.forEach((s, idx) => {
      waypoints.push({
        id: `${s.type}-${s.passenger.id}`,
        name: s.name,
        coords: s.coords,
        type: s.type,
        passengerId: s.passenger.id,
        passengerName: s.passenger.passengerName,
        order: idx + 1,
      });
    });

    waypoints.push({
      id: `dest-${driverRoute.id}`,
      name: driverRoute.destination.name,
      coords: endPoint,
      type: 'destination',
      order: waypoints.length,
    });

    const routeCoords = waypoints.map((w) => w.coords);
    const optimizedPath = interpolatePolyline(routeCoords, 6);
    const totalDistanceKm = calculatePathLength(optimizedPath);
    const origDistanceKm = calculatePathLength(driverRoute.pathCoordinates);
    const detourKm = Math.max(0, Number((totalDistanceKm - origDistanceKm).toFixed(2)));

    return {
      optimizedWaypoints: waypoints,
      totalDistanceKm,
      detourKm,
      optimizedPath,
    };
  }
}

export const routeOptimizer: IOptimizationProvider = new DemoOptimizationProvider();
