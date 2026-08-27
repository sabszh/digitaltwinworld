export const UX_TIMING = {
  searchToBoardingMs: 560,
  boardingPassSlideMs: 800,
  /** How long the counter takes to drift from 2026 up to 2045. Deliberately far
   *  longer than a generation takes: the counter decelerates and waits rather
   *  than arriving at 2046 while the app is still fetching. */
  yearCounterApproachMs: 30000,
  /** The final step onto 2046, once the destination is actually ready. */
  yearCounterLandMs: 900,
  minimumTravelLoadingMs: 6400,
  dilemmaFetchTimeoutMs: 45000,
  /** Failed destination generations stay behind the travel animation and retry
   *  with a capped backoff rather than turning into a participant-facing error. */
  dilemmaRetryBaseMs: 1500,
  dilemmaRetryMaxMs: 8000,
  destinationRevealHoldMs: 3000,
  arrivalCtaDelayMs: 3000,
} as const;
