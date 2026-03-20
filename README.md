# GazeLearn

GazeLearn is a production-ready attention-aware educational web application that adapts lessons based on real-time gaze patterns and accessibility-first reading behavior.

It combines client-side eye tracking (WebGazer), deterministic attention heuristics, subtle adaptive support, focus mode, personalized quiz generation, and a session analytics dashboard.

## Why It Is Innovative

- Uses live gaze coordinates to identify reading friction in structured educational content.
- Adapts support in real time with contextual hints (simplified explanation, example, relevance).
- Detects skip behavior and unstable attention patterns with explicit heuristics.
- Produces a personalized quiz from what the learner skipped or struggled with.
- Keeps gaze processing local by default and supports full fallback mode without camera permission.

## Features

- Landing page with product narrative and privacy/accessibility section.
- Calibration flow with permission-aware eye tracking setup.
- Graceful fallback mode when camera permission is denied or unsupported.
- Reading-first lesson reader with active section highlighting and progress tracking.
- Attention analyzer with events for:
  - active reading block
  - prolonged focus
  - skipped critical sections
  - instability / scattered gaze
  - re-reading
- Adaptive support panel with dismissible hints and anti-spam cooldown behavior.
- Focus mode that reduces visual noise and increases readability.
- Personalized quiz generated from session analytics.
- Session summary dashboard with reading time, high-friction sections, skipped criticals, hints, quiz score, and heatmap-like section attention bars.
- Privacy and accessibility routes.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Reusable UI primitives inspired by shadcn/ui patterns
- Framer Motion
- Zustand
- WebGazer.js (client-side script integration)
- Zod
- Vitest + React Testing Library
- Playwright
- ESLint + Prettier
- Docker + GitHub Actions CI

## Project Structure

- `app/` route pages and layout
- `components/` UI, layout, marketing, summary
- `features/gaze/` WebGazer adapter and attention analyzer
- `features/lesson/` calibration, lesson experience, reader, repository/schemas
- `features/quiz/` personalization and quiz flow
- `features/analytics/` summary aggregation
- `features/session/` Zustand session store/selectors
- `data/lessons/` structured lesson seed JSON
- `types/` shared domain types
- `tests/` unit, component, and e2e tests
- `docs/` architecture/privacy/accessibility/heuristics documentation

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm ci
```

### Run

```bash
npm run dev
```

Open http://localhost:3000

## Scripts

```bash
npm run dev          # start development server
npm run lint         # eslint checks
npm run test         # vitest unit/component tests
npm run test:e2e     # playwright end-to-end tests
npm run build        # production build
npm run start        # run production server (after build)
npm run format       # prettier check
npm run format:write # prettier write
```

## Privacy Model

- Eye tracking is optional and permission-aware.
- Gaze coordinates are processed client-side.
- Session analytics are stored locally in browser storage for the local demo flow.
- No backend is required for core functionality.
- Fallback mode works end-to-end without camera permission.

See [docs/privacy.md](docs/privacy.md) for full details.

## Accessibility

- Semantic page structure and landmarks.
- Keyboard reachable controls and visible focus states.
- High-contrast-friendly color choices.
- Reduced motion support via `prefers-reduced-motion`.
- Fallback mode supports camera-free usage.

See [docs/accessibility.md](docs/accessibility.md).

## Architecture and Heuristics

- Architecture: [docs/architecture.md](docs/architecture.md)
- Attention heuristics: [docs/attention-heuristics.md](docs/attention-heuristics.md)

## Testing Coverage

- Unit tests for attention analyzer heuristics.
- Unit tests for quiz personalization and scoring.
- Component tests for calibration and lesson reader interaction.
- Playwright coverage for:
  - landing page load
  - calibration flow
  - fallback mode without permission
  - lesson -> quiz -> summary end-to-end flow

## Docker

Build and run with Docker Compose:

```bash
docker compose up --build
```

Application is exposed on `http://localhost:3000`.

## CI

GitHub Actions workflow runs:

1. lint
2. unit/component tests
3. playwright e2e tests
4. production build

Workflow file: `.github/workflows/ci.yml`

## Screenshot Placeholders

- `docs/screenshots/landing.png`
- `docs/screenshots/calibration.png`
- `docs/screenshots/lesson-reader.png`
- `docs/screenshots/quiz.png`
- `docs/screenshots/summary.png`

(Placeholders are documented paths for demo/report packaging.)
