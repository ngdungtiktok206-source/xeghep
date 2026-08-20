export type Coordinates = {
  lat: number;
  lng: number;
};

export type Location = {
  id: string;
  name: string;
  address: string;
  coords: Coordinates;
  province: string;
  isMeetingPoint?: boolean;
};

export type VehicleType = '4_seats' | '7_seats' | '9_seats';

export type Vehicle = {
  id: string;
  model: string;
  licensePlate: string;
  color: string;
  type: VehicleType;
  totalSeats: number;
  features: string[];
  photoUrl?: string;
};

export type TimeWindow = {
  start: string; // "08:00"
  end: string;   // "09:30"
  date: string;  // "2026-08-20"
};

export type RideType = 'shared' | 'private' | 'row';
export type PickupType = 'door_to_door' | 'meeting_point';

export type PassengerPreferences = {
  noSmoking?: boolean;
  quietRide?: boolean;
  petFriendly?: boolean;
  largeTrunk?: boolean;
  womenOnly?: boolean;
  frontSeatPreferred?: boolean;
};

export type PassengerRequest = {
  id: string;
  passengerName: string;
  passengerPhone: string;
  passengerAvatar?: string;
  origin: Location;
  destination: Location;
  departureWindow: TimeWindow;
  seats: number;
  rideType: RideType;
  pickupType: PickupType;
  preferences?: PassengerPreferences;
  status: 'pending' | 'matched' | 'confirmed' | 'cancelled';
  matchedDriverId?: string;
  createdAt: string;
};

export type DriverProfile = {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  rating: number;
  totalTrips: number;
  isIdentityVerified: boolean;
  isLicenseVerified: boolean;
  isVehicleVerified: boolean;
  trustScore: number;
};

export type Waypoint = {
  id: string;
  name: string;
  coords: Coordinates;
  type: 'origin' | 'pickup' | 'dropoff' | 'destination' | 'corridor_stop';
  estimatedTime?: string;
  passengerId?: string;
  passengerName?: string;
  order: number;
};

export type DriverRoute = {
  id: string;
  driverId: string;
  driver: DriverProfile;
  origin: Location;
  destination: Location;
  departureWindow: TimeWindow;
  vehicle: Vehicle;
  occupiedSeats: number;
  availableSeats: number;
  basePricePerSeat: number;
  waypoints: Waypoint[];
  pathCoordinates: Coordinates[];
  corridorWidthKm: number; // e.g., 2km
  status: 'scheduled' | 'in_transit' | 'completed' | 'cancelled';
  matchedPassengerIds: string[];
};

export type RouteGeometry = {
  distanceKm: number;
  durationMinutes: number;
  path: Coordinates[];
};

export type MatchCandidate = {
  driverRoute: DriverRoute;
  passengerRequest: PassengerRequest;
  isFeasible: boolean;
  rejectionReason?: string;
  
  // Metric breakdowns
  routeCompatibility: number;     // 0 - 100%
  routeOverlap: number;            // 0 - 100%
  directionSimilarity: number;     // 0 - 1.0 (cosine / angle similarity)
  detourKm: number;               // extra km for driver
  detourMinutes: number;          // extra minutes
  normalizedDetour: number;       // 0 - 1.0
  
  initialOccupiedSeats: number;
  newOccupiedSeats: number;
  initialFillRate: number;        // e.g. 71.4%
  projectedFillRate: number;      // e.g. 100%
  
  costEfficiency: number;         // 0 - 100% (passenger saving + driver revenue boost)
  preferenceMatch: number;        // 0 - 100%
  
  totalScore: number;             // 0 - 100
  
  // Price breakdown
  pricing: PricingQuote;
  
  // Match explanation
  explanationPoints: string[];
  
  // Route geometry with detour
  optimizedWaypoints: Waypoint[];
  optimizedPath: Coordinates[];
};

export type PricingQuote = {
  basePrice: number;
  distanceKm: number;
  distanceCharge: number;
  pickupSurcharge: number;
  rideTypeAdjustment: number;
  sharedRideDiscount: number;
  totalPrice: number;
  originalPrivatePrice: number;
  savedPercentage: number;
  currency: string;
};

export type MatchingWeights = {
  detourWeight: number;      // w1 (default 0.40)
  fillRateWeight: number;    // w2 (default 0.30)
  costWeight: number;        // w3 (default 0.20)
  preferenceWeight: number;  // w4 (default 0.10)
  corridorWidthKm: number;   // default 2.0 km
  maxAllowedDetourKm: number;// default 12.0 km
};

export type MatchingSearchResult = {
  passengerRequest: PassengerRequest;
  totalDriversEvaluated: number;
  feasibleCount: number;
  rejectedCount: number;
  matchedCandidates: MatchCandidate[];
  rejectedCandidates: MatchCandidate[];
  topMatches: MatchCandidate[];
  weightsUsed: MatchingWeights;
  timestamp: string;
};

export type Booking = {
  id: string;
  passengerRequestId: string;
  driverRouteId: string;
  passengerName: string;
  passengerPhone: string;
  driverName: string;
  vehicleModel: string;
  licensePlate: string;
  originName: string;
  destinationName: string;
  departureTime: string;
  departureDate: string;
  seats: number;
  rideType: RideType;
  pickupType: PickupType;
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'cash_on_pickup';
  status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
};
