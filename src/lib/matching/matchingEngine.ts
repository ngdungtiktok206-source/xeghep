import { DriverRoute, MatchCandidate, MatchingWeights, PassengerRequest } from '../../types';
import { DEFAULT_MATCHING_WEIGHTS, evaluateCandidate } from './scoring';

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

export class MatchingEngine {
  /**
   * Evaluates all active driver routes against a passenger request
   */
  static findMatches(
    request: PassengerRequest,
    driverRoutes: DriverRoute[],
    weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS
  ): MatchingSearchResult {
    const allEvaluated = driverRoutes.map((driver) => evaluateCandidate(driver, request, weights));

    const matchedCandidates = allEvaluated
      .filter((c) => c.isFeasible)
      .sort((a, b) => b.totalScore - a.totalScore);

    const rejectedCandidates = allEvaluated.filter((c) => !c.isFeasible);

    return {
      passengerRequest: request,
      totalDriversEvaluated: driverRoutes.length,
      feasibleCount: matchedCandidates.length,
      rejectedCount: rejectedCandidates.length,
      matchedCandidates,
      rejectedCandidates,
      topMatches: matchedCandidates.slice(0, 3),
      weightsUsed: weights,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Recalculates match matrix when weights or parameters are adjusted in Admin/Demo panel
   */
  static recalculateAll(
    requests: PassengerRequest[],
    driverRoutes: DriverRoute[],
    weights: MatchingWeights
  ): Record<string, MatchingSearchResult> {
    const results: Record<string, MatchingSearchResult> = {};
    for (const req of requests) {
      results[req.id] = this.findMatches(req, driverRoutes, weights);
    }
    return results;
  }
}
