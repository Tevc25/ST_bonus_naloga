import type { Lesson } from "@/types/lesson";
import type { SessionSnapshot } from "@/types/session";

export function getSkippedCriticalSections(
  snapshot: SessionSnapshot,
  lesson: Lesson
): string[] {
  return lesson.sections
    .filter((section) => section.importance === "critical")
    .filter((section) => snapshot.sections[section.id]?.skipped)
    .map((section) => section.id);
}

export function getMostViewedSections(
  snapshot: SessionSnapshot,
  top = 3
): string[] {
  return Object.values(snapshot.sections)
    .sort((a, b) => b.focusMs - a.focusMs)
    .slice(0, top)
    .map((section) => section.sectionId);
}

export function getHighFrictionSections(snapshot: SessionSnapshot): string[] {
  return Object.values(snapshot.sections)
    .filter((section) => section.prolongedFocusCount > 0 || section.rereads > 0)
    .sort(
      (a, b) =>
        b.prolongedFocusCount + b.rereads - (a.prolongedFocusCount + a.rereads)
    )
    .map((section) => section.sectionId);
}
