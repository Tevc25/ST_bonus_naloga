# Privacy

## Core Principle

GazeLearn processes gaze data locally by default.

## What Is Collected

During a session, the app stores local analytics such as:

- section focus durations
- visit counts
- heuristic events (prolonged focus, skipped critical, instability, reread)
- adaptive hint counts
- quiz answers and score

This data is used only to personalize the current learning flow and summary in the local demo.

## What Is Not Sent by Default

- Raw gaze coordinates are not sent to a backend service.
- Camera frames are not uploaded by default.
- No mandatory account or remote persistence is required.

## Permission Model

- Camera permission is explicit and optional.
- User can continue in fallback mode without camera.
- Permission denial does not block lesson completion.

## Storage

- Session state is persisted in local browser storage for demo continuity.
- Clearing browser storage clears local session data.

## User Control

- Adaptive hints are dismissible.
- Focus mode can be manually toggled.
- User can complete full flow without enabling eye tracking.
