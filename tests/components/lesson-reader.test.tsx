import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LessonReader } from "@/features/lesson/lesson-reader";
import type { Lesson } from "@/types/lesson";

const lesson: Lesson = {
  id: "lesson-test",
  title: "Lesson title",
  subtitle: "Lesson subtitle",
  estimatedMinutes: 10,
  sections: [
    {
      id: "sec-1",
      heading: "Section one",
      paragraphs: ["Paragraph one"],
      keyConcepts: ["Concept"],
      difficultyHint: "Hint",
      whyItMatters: "It matters",
      importance: "critical",
      quizQuestionIds: ["q1"]
    },
    {
      id: "sec-2",
      heading: "Section two",
      paragraphs: ["Paragraph two"],
      keyConcepts: ["Concept"],
      difficultyHint: "Hint",
      whyItMatters: "It matters",
      importance: "supporting",
      quizQuestionIds: ["q2"]
    }
  ],
  questions: []
};

describe("LessonReader", () => {
  it("shows active section and toggles focus mode", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <LessonReader
        lesson={lesson}
        activeSectionId="sec-1"
        sectionStats={{
          "sec-1": {
            sectionId: "sec-1",
            focusMs: 2000,
            visits: 1,
            rereads: 0,
            prolongedFocusCount: 0,
            skipped: false
          }
        }}
        focusModeEnabled={false}
        onFocusModeChange={onToggle}
        onFinishLesson={vi.fn()}
        registerSectionRef={() => vi.fn()}
        sidebarContent={<div>Hints panel</div>}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Section one" })
    ).toBeInTheDocument();
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");

    await user.click(screen.getByRole("switch"));

    expect(onToggle).toHaveBeenCalledWith(true);
  });
});
