# Attention Heuristics

The app uses deterministic client-side heuristics in `features/gaze/attention-analyzer.ts`.

## Threshold Configuration

Defined in `features/gaze/config.ts`:

- `sampleIntervalMs = 120`
- `maxSampleDeltaMs = 350`
- `prolongedFocusMs = 7000`
- `skippedAttentionMs = 1800`
- `instabilityWindowMs = 4500`
- `instabilityJumpDistancePx = 340`
- `instabilityJumpCount = 6`
- `instabilityCooldownMs = 12000`
- `rereadReturnGapMs = 4000`

## Event Definitions

### Active Reading Block

A gaze point is assigned to the section whose viewport rectangle contains the coordinate.
When active section changes, a visit is recorded.

### Prolonged Focus

If gaze remains in one section beyond `prolongedFocusMs` during the same visit, emit:

- `prolonged_focus`

Used to trigger simplified explanations/examples.

### Skipped Critical Section

When gaze jumps forward across one or more sections, intermediate critical sections are checked.
If focus time is below `skippedAttentionMs`, emit:

- `skipped_critical`

Used to prompt review.

### Gaze Instability / Scattered Attention

If repeated large coordinate jumps occur inside `instabilityWindowMs`, and jump count reaches
`instabilityJumpCount`, emit:

- `instability`

Used to suggest focus mode.

### Re-reading

If user leaves a section and returns after at least `rereadReturnGapMs`, emit:

- `reread`

Used as friction signal for quiz personalization.

## Fallback Mode Heuristics

Without camera permission, section activity is estimated by viewport position:

- active section inferred from viewport midpoint
- focus time increments periodically for active section

This preserves personalization and analytics without eye tracking.

## Limitations

- Browser/camera conditions influence gaze quality.
- Heuristics are intentionally interpretable, not ML-personalized.
- Section-level detection is more stable than line-level detection in a generic web environment.
