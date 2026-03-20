import { describe, expect, it } from "vitest";

import {
  buildPersonalizedQuiz,
  scoreQuiz
} from "@/features/quiz/personalization";
import type { Lesson } from "@/types/lesson";
import type { SessionSnapshot } from "@/types/session";

const lesson: Lesson = {
  id: "demo",
  title: "Demo",
  subtitle: "Demo subtitle",
  estimatedMinutes: 5,
  sections: [
    {
      id: "s1",
      heading: "Section 1",
      paragraphs: ["a"],
      keyConcepts: ["one"],
      difficultyHint: "hint",
      whyItMatters: "matter",
      importance: "critical",
      quizQuestionIds: ["q1"]
    },
    {
      id: "s2",
      heading: "Section 2",
      paragraphs: ["b"],
      keyConcepts: ["two"],
      difficultyHint: "hint",
      whyItMatters: "matter",
      importance: "critical",
      quizQuestionIds: ["q2"]
    },
    {
      id: "s3",
      heading: "Section 3",
      paragraphs: ["c"],
      keyConcepts: ["three"],
      difficultyHint: "hint",
      whyItMatters: "matter",
      importance: "supporting",
      quizQuestionIds: ["q3"]
    }
  ],
  questions: [
    {
      id: "q1",
      sectionId: "s1",
      prompt: "Question 1",
      choices: [
        { id: "a", text: "A" },
        { id: "b", text: "B" }
      ],
      correctChoiceId: "a",
      explanation: "exp"
    },
    {
      id: "q2",
      sectionId: "s2",
      prompt: "Question 2",
      choices: [
        { id: "a", text: "A" },
        { id: "b", text: "B" }
      ],
      correctChoiceId: "b",
      explanation: "exp"
    },
    {
      id: "q3",
      sectionId: "s3",
      prompt: "Question 3",
      choices: [
        { id: "a", text: "A" },
        { id: "b", text: "B" }
      ],
      correctChoiceId: "a",
      explanation: "exp"
    }
  ]
};

function createSnapshot(partial: Partial<SessionSnapshot>): SessionSnapshot {
  return {
    lessonId: "demo",
    mode: "tracking",
    cameraStatus: "granted",
    calibrationCompleted: true,
    startedAt: 0,
    endedAt: 1000,
    activeSectionId: null,
    focusModeEnabled: false,
    focusModeSuggested: false,
    instabilityEvents: 0,
    hintsShown: 0,
    hintsDismissed: {},
    sections: {},
    attentionEvents: [],
    hintLogs: [],
    quizResult: null,
    ...partial
  };
}

describe("buildPersonalizedQuiz", () => {
  it("prioritizes skipped sections first", () => {
    const snapshot = createSnapshot({
      sections: {
        s2: {
          sectionId: "s2",
          focusMs: 100,
          visits: 1,
          rereads: 0,
          prolongedFocusCount: 0,
          skipped: true
        }
      }
    });

    const quiz = buildPersonalizedQuiz(lesson, snapshot, { maxQuestions: 2 });

    expect(quiz.items[0]?.question.sectionId).toBe("s2");
    expect(quiz.items[0]?.reason).toBe("skipped");
  });

  it("prioritizes high friction sections after skipped sections", () => {
    const snapshot = createSnapshot({
      sections: {
        s1: {
          sectionId: "s1",
          focusMs: 5000,
          visits: 2,
          rereads: 2,
          prolongedFocusCount: 1,
          skipped: false
        }
      }
    });

    const quiz = buildPersonalizedQuiz(lesson, snapshot, { maxQuestions: 1 });

    expect(quiz.items[0]?.question.sectionId).toBe("s1");
    expect(quiz.items[0]?.reason).toBe("high_friction");
  });
});

describe("scoreQuiz", () => {
  it("returns score and wrong question IDs", () => {
    const items = [
      { question: lesson.questions[0], reason: "coverage" as const },
      { question: lesson.questions[1], reason: "coverage" as const }
    ];

    const result = scoreQuiz(items, {
      q1: "a",
      q2: "a"
    });

    expect(result.score).toBe(1);
    expect(result.total).toBe(2);
    expect(result.wrongQuestionIds).toEqual(["q2"]);
  });
});
