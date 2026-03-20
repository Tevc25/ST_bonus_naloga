export interface GazePoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface SectionLayout {
  id: string;
  index: number;
  importance: "critical" | "supporting";
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export type AttentionEventType =
  | "prolonged_focus"
  | "skipped_critical"
  | "instability"
  | "reread";

export interface AttentionEvent {
  type: AttentionEventType;
  timestamp: number;
  sectionId?: string;
}

export interface AnalyzerOutput {
  activeSectionId?: string;
  focusDeltas: Array<{ sectionId: string; deltaMs: number }>;
  events: AttentionEvent[];
}
