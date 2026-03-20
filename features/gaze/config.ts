export const gazeHeuristicsConfig = {
  sampleIntervalMs: 120,
  maxSampleDeltaMs: 350,
  prolongedFocusMs: 7000,
  skippedAttentionMs: 1800,
  instabilityWindowMs: 4500,
  instabilityJumpDistancePx: 340,
  instabilityJumpCount: 6,
  instabilityCooldownMs: 12000,
  rereadReturnGapMs: 4000
} as const;
