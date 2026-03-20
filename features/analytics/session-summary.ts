import {
  getHighFrictionSections,
  getMostViewedSections,
  getSkippedCriticalSections
} from "@/features/session/selectors";
import type { Lesson } from "@/types/lesson";
import type { SessionSnapshot } from "@/types/session";

export interface SessionSummary {
  totalReadingMs: number;
  mostViewedSectionIds: string[];
  skippedCriticalSectionIds: string[];
  repeatedAttentionSectionIds: string[];
  hintsShown: number;
  instabilityEvents: number;
  quizScore: number | null;
  quizTotal: number | null;
}

export function buildSessionSummary(
  snapshot: SessionSnapshot,
  lesson: Lesson
): SessionSummary {
  const fallbackEndedAt = Date.now();
  const totalReadingMs = snapshot.startedAt
    ? (snapshot.endedAt ?? fallbackEndedAt) - snapshot.startedAt
    : 0;

  return {
    totalReadingMs,
    mostViewedSectionIds: getMostViewedSections(snapshot),
    skippedCriticalSectionIds: getSkippedCriticalSections(snapshot, lesson),
    repeatedAttentionSectionIds: getHighFrictionSections(snapshot),
    hintsShown: snapshot.hintsShown,
    instabilityEvents: snapshot.instabilityEvents,
    quizScore: snapshot.quizResult?.score ?? null,
    quizTotal: snapshot.quizResult?.total ?? null
  };
}
