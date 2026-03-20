import type { AttentionEvent } from "@/types/gaze";

export interface SectionAnalytics {
  sectionId: string;
  focusMs: number;
  visits: number;
  rereads: number;
  prolongedFocusCount: number;
  skipped: boolean;
}

export interface QuizResult {
  score: number;
  total: number;
  answers: Record<string, string>;
  completedAt: number;
  questionIds: string[];
}

export interface HintLog {
  sectionId: string;
  kind: "stuck" | "review" | "focus";
  shownAt: number;
}

export interface SessionSnapshot {
  lessonId: string | null;
  mode: "idle" | "tracking" | "fallback";
  cameraStatus: "unknown" | "granted" | "denied" | "unsupported";
  calibrationCompleted: boolean;
  startedAt: number | null;
  endedAt: number | null;
  activeSectionId: string | null;
  focusModeEnabled: boolean;
  focusModeSuggested: boolean;
  instabilityEvents: number;
  hintsShown: number;
  hintsDismissed: Record<string, number>;
  sections: Record<string, SectionAnalytics>;
  attentionEvents: AttentionEvent[];
  hintLogs: HintLog[];
  quizResult: QuizResult | null;
}
