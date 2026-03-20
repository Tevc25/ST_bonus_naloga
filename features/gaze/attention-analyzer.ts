import { gazeHeuristicsConfig } from "@/features/gaze/config";
import type {
  AnalyzerOutput,
  AttentionEvent,
  GazePoint,
  SectionLayout
} from "@/types/gaze";

interface SectionRuntimeState {
  totalFocusMs: number;
  visits: number;
  enteredAt: number | null;
  lastExitAt: number | null;
  prolongedTriggeredInVisit: boolean;
}

function createSectionRuntimeState(): SectionRuntimeState {
  return {
    totalFocusMs: 0,
    visits: 0,
    enteredAt: null,
    lastExitAt: null,
    prolongedTriggeredInVisit: false
  };
}

function distance(a: GazePoint, b: GazePoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function pointInSection(point: GazePoint, section: SectionLayout): boolean {
  return (
    point.x >= section.left &&
    point.x <= section.right &&
    point.y >= section.top &&
    point.y <= section.bottom
  );
}

export class AttentionAnalyzer {
  private layouts: SectionLayout[] = [];
  private runtime = new Map<string, SectionRuntimeState>();
  private skippedSections = new Set<string>();
  private activeSectionId: string | null = null;
  private lastSample: GazePoint | null = null;
  private jumpTimestamps: number[] = [];
  private lastInstabilityAt = 0;

  setLayouts(layouts: SectionLayout[]) {
    this.layouts = [...layouts].sort((a, b) => a.index - b.index);

    for (const layout of this.layouts) {
      if (!this.runtime.has(layout.id)) {
        this.runtime.set(layout.id, createSectionRuntimeState());
      }
    }
  }

  reset() {
    this.runtime.clear();
    this.skippedSections.clear();
    this.activeSectionId = null;
    this.lastSample = null;
    this.jumpTimestamps = [];
    this.lastInstabilityAt = 0;
  }

  processSample(sample: GazePoint): AnalyzerOutput {
    const events: AttentionEvent[] = [];
    const focusDeltas: Array<{ sectionId: string; deltaMs: number }> = [];

    const activeLayout = this.layouts.find((layout) =>
      pointInSection(sample, layout)
    );
    const nextSectionId = activeLayout?.id ?? null;

    if (this.lastSample) {
      const jumpDistance = distance(sample, this.lastSample);
      if (jumpDistance >= gazeHeuristicsConfig.instabilityJumpDistancePx) {
        this.jumpTimestamps.push(sample.timestamp);
      }

      this.jumpTimestamps = this.jumpTimestamps.filter(
        (timestamp) =>
          sample.timestamp - timestamp <=
          gazeHeuristicsConfig.instabilityWindowMs
      );

      if (
        this.jumpTimestamps.length >=
          gazeHeuristicsConfig.instabilityJumpCount &&
        sample.timestamp - this.lastInstabilityAt >=
          gazeHeuristicsConfig.instabilityCooldownMs
      ) {
        events.push({
          type: "instability",
          timestamp: sample.timestamp,
          sectionId: nextSectionId ?? undefined
        });
        this.lastInstabilityAt = sample.timestamp;
        this.jumpTimestamps = [];
      }
    }

    if (nextSectionId && this.lastSample) {
      const rawDelta = sample.timestamp - this.lastSample.timestamp;
      const deltaMs = Math.min(
        Math.max(rawDelta, 0),
        gazeHeuristicsConfig.maxSampleDeltaMs
      );
      const state = this.getSectionState(nextSectionId);
      state.totalFocusMs += deltaMs;
      focusDeltas.push({ sectionId: nextSectionId, deltaMs });
    }

    if (nextSectionId !== this.activeSectionId) {
      const previousSectionId = this.activeSectionId;
      if (previousSectionId) {
        const previousState = this.getSectionState(previousSectionId);
        previousState.lastExitAt = sample.timestamp;
        previousState.enteredAt = null;
      }

      if (nextSectionId) {
        const nextState = this.getSectionState(nextSectionId);

        if (
          nextState.lastExitAt &&
          sample.timestamp - nextState.lastExitAt >=
            gazeHeuristicsConfig.rereadReturnGapMs &&
          nextState.visits >= 1
        ) {
          events.push({
            type: "reread",
            sectionId: nextSectionId,
            timestamp: sample.timestamp
          });
        }

        nextState.visits += 1;
        nextState.enteredAt = sample.timestamp;
        nextState.prolongedTriggeredInVisit = false;

        if (previousSectionId) {
          this.detectSkippedCriticalSections(
            previousSectionId,
            nextSectionId,
            sample.timestamp,
            events
          );
        }
      }
    }

    if (nextSectionId) {
      const state = this.getSectionState(nextSectionId);
      if (
        state.enteredAt &&
        !state.prolongedTriggeredInVisit &&
        sample.timestamp - state.enteredAt >=
          gazeHeuristicsConfig.prolongedFocusMs
      ) {
        events.push({
          type: "prolonged_focus",
          sectionId: nextSectionId,
          timestamp: sample.timestamp
        });
        state.prolongedTriggeredInVisit = true;
      }
    }

    const output: AnalyzerOutput = {
      activeSectionId: nextSectionId ?? undefined,
      focusDeltas,
      events
    };

    this.activeSectionId = nextSectionId;
    this.lastSample = sample;

    return output;
  }

  getSectionTotals(): Record<string, { totalFocusMs: number; visits: number }> {
    return Object.fromEntries(
      Array.from(this.runtime.entries()).map(([sectionId, state]) => [
        sectionId,
        {
          totalFocusMs: state.totalFocusMs,
          visits: state.visits
        }
      ])
    );
  }

  private detectSkippedCriticalSections(
    previousSectionId: string,
    nextSectionId: string,
    timestamp: number,
    events: AttentionEvent[]
  ) {
    const previousLayout = this.layouts.find(
      (layout) => layout.id === previousSectionId
    );
    const nextLayout = this.layouts.find(
      (layout) => layout.id === nextSectionId
    );
    if (!previousLayout || !nextLayout) {
      return;
    }

    const movedForwardBy = nextLayout.index - previousLayout.index;
    if (movedForwardBy < 2) {
      return;
    }

    const skippedCandidates = this.layouts.filter(
      (layout) =>
        layout.index > previousLayout.index &&
        layout.index < nextLayout.index &&
        layout.importance === "critical"
    );

    for (const candidate of skippedCandidates) {
      if (this.skippedSections.has(candidate.id)) {
        continue;
      }

      const state = this.getSectionState(candidate.id);
      if (state.totalFocusMs < gazeHeuristicsConfig.skippedAttentionMs) {
        this.skippedSections.add(candidate.id);
        events.push({
          type: "skipped_critical",
          sectionId: candidate.id,
          timestamp
        });
      }
    }
  }

  private getSectionState(sectionId: string): SectionRuntimeState {
    const existing = this.runtime.get(sectionId);
    if (existing) {
      return existing;
    }

    const next = createSectionRuntimeState();
    this.runtime.set(sectionId, next);
    return next;
  }
}
