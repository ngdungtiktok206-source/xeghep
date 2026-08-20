import { Booking, DriverRoute, MatchingWeights, PassengerRequest } from '../../types';
import { DEFAULT_MATCHING_WEIGHTS } from '../matching/scoring';
import { INITIAL_DRIVERS, INITIAL_PASSENGERS } from './mockData';

export class TripRepository {
  private static instance: TripRepository;

  private drivers: DriverRoute[] = [];
  private passengers: PassengerRequest[] = [];
  private bookings: Booking[] = [];
  private weights: MatchingWeights = { ...DEFAULT_MATCHING_WEIGHTS };

  private constructor() {
    this.resetToDefault();
  }

  public static getInstance(): TripRepository {
    if (!TripRepository.instance) {
      TripRepository.instance = new TripRepository();
    }
    return TripRepository.instance;
  }

  public resetToDefault(): void {
    // Deep clone to prevent direct state mutations
    this.drivers = JSON.parse(JSON.stringify(INITIAL_DRIVERS));
    this.passengers = JSON.parse(JSON.stringify(INITIAL_PASSENGERS));
    this.weights = { ...DEFAULT_MATCHING_WEIGHTS };
    this.bookings = [
      {
        id: 'BK_001',
        passengerRequestId: 'PR_SEED_01',
        driverRouteId: 'DRV_01',
        passengerName: 'Lê Minh Anh',
        passengerPhone: '0905 123 456',
        driverName: 'Nguyễn Văn An',
        vehicleModel: 'Toyota Innova Cross 2024',
        licensePlate: '29A-888.36',
        originName: 'Bến xe Giáp Bát, Hà Nội',
        destinationName: 'TP. Ninh Bình',
        departureTime: '08:00',
        departureDate: '2026-08-20',
        seats: 2,
        rideType: 'shared',
        pickupType: 'meeting_point',
        totalPrice: 360000,
        paymentStatus: 'paid',
        status: 'confirmed',
        createdAt: '2026-08-19T08:00:00Z',
      },
    ];
  }

  public getDrivers(): DriverRoute[] {
    return this.drivers;
  }

  public getDriverById(id: string): DriverRoute | undefined {
    return this.drivers.find((d) => d.id === id);
  }

  public getPassengers(): PassengerRequest[] {
    return this.passengers;
  }

  public getPassengerById(id: string): PassengerRequest | undefined {
    return this.passengers.find((p) => p.id === id);
  }

  public createPassengerRequest(request: PassengerRequest): PassengerRequest {
    this.passengers.unshift(request);
    return request;
  }

  public getBookings(): Booking[] {
    return this.bookings;
  }

  public createBooking(booking: Booking): Booking {
    this.bookings.unshift(booking);

    // Update driver available seats and matched passenger list
    const driver = this.getDriverById(booking.driverRouteId);
    if (driver) {
      driver.occupiedSeats = Math.min(driver.vehicle.totalSeats, driver.occupiedSeats + booking.seats);
      driver.availableSeats = Math.max(0, driver.vehicle.totalSeats - driver.occupiedSeats);
      if (!driver.matchedPassengerIds.includes(booking.passengerRequestId)) {
        driver.matchedPassengerIds.push(booking.passengerRequestId);
      }
    }

    // Update passenger request status
    const passenger = this.getPassengerById(booking.passengerRequestId);
    if (passenger) {
      passenger.status = 'confirmed';
      passenger.matchedDriverId = booking.driverRouteId;
    }

    return booking;
  }

  public getWeights(): MatchingWeights {
    return this.weights;
  }

  public updateWeights(newWeights: Partial<MatchingWeights>): MatchingWeights {
    this.weights = { ...this.weights, ...newWeights };
    return this.weights;
  }
}

export const tripRepository = TripRepository.getInstance();
