# GazeLearn Architecture

## Overview

GazeLearn is a client-first adaptive learning system. The architecture intentionally separates:

- UI rendering
- gaze input integration
- attention analysis heuristics
- session analytics state
- quiz personalization

This keeps eye-tracking concerns out of route/page components and allows deterministic testing.

## High-Level Flow

1. User enters `/lesson/demo`.
2. Calibration flow requests optional camera permission.
3. If tracking is enabled, WebGazer emits gaze points.
4. Attention analyzer maps gaze to section layouts and emits events.
5. Session store aggregates focus, visits, skips, rereads, instability, and hint logs.
6. Adaptive support panel displays subtle hints with cooldown/dismiss behavior.
7. User enters personalized quiz generated from session analytics.
8. `/summary` dashboard renders learning analytics and quiz outcome.

## Modules

### `features/gaze`

- `use-gaze-tracking.ts`: WebGazer startup/teardown, permission handling, throttled gaze point stream.
- `webgazer-loader.ts`: script loader.
- `attention-analyzer.ts`: deterministic heuristics and event generation.
- `config.ts`: centralized heuristic thresholds.

### `features/lesson`

- `calibration-flow.tsx`: permission/camera calibration UX + fallback path.
- `lesson-reader.tsx`: reading-first content UI and progress.
- `lesson-experience.tsx`: orchestration layer (calibration -> reader -> quiz).
- `lesson-repository.ts`: local seed loading and validation.
- `schemas.ts`: Zod schemas for lesson shape.

### `features/session`

- `gaze-session-store.ts`: Zustand state for analytics and session lifecycle.
- `selectors.ts`: derived data helpers.

### `features/quiz`

- `personalization.ts`: question targeting logic + scoring.
- `personalized-quiz.tsx`: interactive quiz UI.

### `features/analytics`

- `session-summary.ts`: summary aggregation from session store.

## Data Layer

- Lesson data is in `data/lessons/demo-lesson.json`.
- Parsed and validated with Zod at load time.
- No database is required for the core demo.

## State Strategy

Zustand store keeps session state local and persistable (local storage) for this demo experience:

- calibration/mode status
- per-section focus and visit metrics
- attention events
- hint logs
- focus mode flags
- quiz result

## Performance Notes

- Gaze updates are throttled before entering analyzer logic.
- Analyzer runs with lightweight in-memory state.
- Section layout recalculation is event/interval-based.
- No server round trips in the core adaptive loop.

## Privacy by Design

- Gaze data does not leave the browser by default.
- Camera permission is optional and explicitly requested.
- Fallback mode preserves full learning flow without camera.
