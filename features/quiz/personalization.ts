import type { Lesson, QuizQuestion } from "@/types/lesson";
import type { SessionSnapshot } from "@/types/session";

export type QuizReason = "skipped" | "high_friction" | "coverage";

export interface PersonalizedQuestion {
  question: QuizQuestion;
  reason: QuizReason;
}

export interface PersonalizedQuiz {
  items: PersonalizedQuestion[];
  targetedSectionIds: string[];
}

interface PersonalizationOptions {
  maxQuestions?: number;
}

function getSectionFrictionScore(
  snapshot: SessionSnapshot,
  sectionId: string
): number {
  const section = snapshot.sections[sectionId];
  if (!section) {
    return 0;
  }

  return section.prolongedFocusCount * 2 + section.rereads;
}

export function buildPersonalizedQuiz(
  lesson: Lesson,
  snapshot: SessionSnapshot,
  options: PersonalizationOptions = {}
): PersonalizedQuiz {
  const maxQuestions = options.maxQuestions ?? 5;

  const skippedSections = lesson.sections
    .filter((section) => snapshot.sections[section.id]?.skipped)
    .map((section) => section.id);

  const highFrictionSections = lesson.sections
    .map((section) => ({
      id: section.id,
      friction: getSectionFrictionScore(snapshot, section.id)
    }))
    .filter((entry) => entry.friction > 0)
    .sort((a, b) => b.friction - a.friction)
    .map((entry) => entry.id)
    .filter((id) => !skippedSections.includes(id));

  const prioritizedSections = [
    ...skippedSections,
    ...highFrictionSections,
    ...lesson.sections.map((section) => section.id)
  ];

  const usedQuestionIds = new Set<string>();
  const targetedSectionIds: string[] = [];
  const items: PersonalizedQuestion[] = [];

  for (const sectionId of prioritizedSections) {
    if (items.length >= maxQuestions) {
      break;
    }

    const sectionQuestions = lesson.questions.filter(
      (question) => question.sectionId === sectionId
    );
    for (const question of sectionQuestions) {
      if (items.length >= maxQuestions) {
        break;
      }

      if (usedQuestionIds.has(question.id)) {
        continue;
      }

      usedQuestionIds.add(question.id);
      targetedSectionIds.push(sectionId);
      items.push({
        question,
        reason: skippedSections.includes(sectionId)
          ? "skipped"
          : highFrictionSections.includes(sectionId)
            ? "high_friction"
            : "coverage"
      });
    }
  }

  return {
    items,
    targetedSectionIds: Array.from(new Set(targetedSectionIds))
  };
}

export function scoreQuiz(
  items: PersonalizedQuestion[],
  answers: Record<string, string>
): { score: number; total: number; wrongQuestionIds: string[] } {
  let score = 0;
  const wrongQuestionIds: string[] = [];

  for (const item of items) {
    const answer = answers[item.question.id];
    if (answer === item.question.correctChoiceId) {
      score += 1;
    } else {
      wrongQuestionIds.push(item.question.id);
    }
  }

  return {
    score,
    total: items.length,
    wrongQuestionIds
  };
}
