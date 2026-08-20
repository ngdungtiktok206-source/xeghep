import { PassengerRequest, PricingQuote } from '../../types';
import { calculateHaversineDistance } from '../routing/geometry';

export const BASE_INTERPROVINCIAL_FARE = 60000; // 60,000 VND base
export const PER_KM_RATE = 1400;                // 1,400 VND / km for shared ride
export const PRIVATE_PER_KM_RATE = 11000;       // 11,000 VND / km for private taxi
export const DOOR_TO_DOOR_SURCHARGE = 30000;    // 30,000 VND for inner city door pickup
export const ROW_BOOKING_MULTIPLIER = 2.2;      // 2.2x for booking a whole seat row
export const PRIVATE_RIDE_MULTIPLIER = 4.5;    // 4.5x for private whole car

export class PricingEngine {
  /**
   * Calculates pricing quote for a passenger request
   */
  static calculateQuote(
    request: Partial<PassengerRequest>,
    overrideDistanceKm?: number
  ): PricingQuote {
    let distanceKm = 80;
    if (overrideDistanceKm) {
      distanceKm = overrideDistanceKm;
    } else if (request.origin && request.destination) {
      distanceKm = calculateHaversineDistance(request.origin.coords, request.destination.coords);
      // Realistic road distance multiplier (usually ~ 1.25x haversine)
      distanceKm = Math.round(distanceKm * 1.25);
    }

    const seats = request.seats || 1;
    const isDoorToDoor = request.pickupType === 'door_to_door';
    const rideType = request.rideType || 'shared';

    const basePrice = BASE_INTERPROVINCIAL_FARE;
    const distanceCharge = Math.round(distanceKm * PER_KM_RATE * seats);
    const pickupSurcharge = isDoorToDoor ? DOOR_TO_DOOR_SURCHARGE * Math.min(seats, 2) : 0;

    let rideTypeAdjustment = 0;
    let sharedRideDiscount = 0;

    if (rideType === 'row') {
      rideTypeAdjustment = Math.round((basePrice + distanceCharge) * (ROW_BOOKING_MULTIPLIER - 1));
    } else if (rideType === 'private') {
      rideTypeAdjustment = Math.round((basePrice + distanceCharge) * (PRIVATE_RIDE_MULTIPLIER - 1));
    } else {
      // Shared ride volume discount: 15% off standard solo rate
      sharedRideDiscount = Math.round((basePrice + distanceCharge) * 0.15);
    }

    const totalPrice = Math.max(
      80000,
      Math.round((basePrice + distanceCharge + pickupSurcharge + rideTypeAdjustment - sharedRideDiscount) / 1000) * 1000
    );

    // Baseline private ride comparison
    const originalPrivatePrice = Math.round((distanceKm * PRIVATE_PER_KM_RATE + 100000) / 1000) * 1000;
    const savedPercentage = Math.min(
      65,
      Math.max(10, Math.round(((originalPrivatePrice - totalPrice) / originalPrivatePrice) * 100))
    );

    return {
      basePrice,
      distanceKm,
      distanceCharge,
      pickupSurcharge,
      rideTypeAdjustment,
      sharedRideDiscount,
      totalPrice,
      originalPrivatePrice,
      savedPercentage,
      currency: 'VNĐ',
    };
  }
}
