import { describe, expect, it } from "vitest";

import { AttentionAnalyzer } from "@/features/gaze/attention-analyzer";
import { gazeHeuristicsConfig } from "@/features/gaze/config";
import type { SectionLayout } from "@/types/gaze";

const layouts: SectionLayout[] = [
  {
    id: "section-a",
    index: 0,
    importance: "critical",
    top: 0,
    bottom: 300,
    left: 0,
    right: 400
  },
  {
    id: "section-b",
    index: 1,
    importance: "critical",
    top: 320,
    bottom: 620,
    left: 0,
    right: 400
  },
  {
    id: "section-c",
    index: 2,
    importance: "supporting",
    top: 640,
    bottom: 940,
    left: 0,
    right: 400
  }
];

describe("AttentionAnalyzer", () => {
  it("emits prolonged focus event after threshold", () => {
    const analyzer = new AttentionAnalyzer();
    analyzer.setLayouts(layouts);

    analyzer.processSample({ x: 100, y: 100, timestamp: 1000 });
    const output = analyzer.processSample({
      x: 110,
      y: 110,
      timestamp: 1000 + gazeHeuristicsConfig.prolongedFocusMs + 20
    });

    expect(
      output.events.some((event) => event.type === "prolonged_focus")
    ).toBe(true);
  });

  it("emits skipped critical when jumping over an important section", () => {
    const analyzer = new AttentionAnalyzer();
    analyzer.setLayouts(layouts);

    analyzer.processSample({ x: 100, y: 100, timestamp: 1000 });
    const output = analyzer.processSample({ x: 120, y: 700, timestamp: 1300 });

    expect(output.events).toContainEqual({
      type: "skipped_critical",
      sectionId: "section-b",
      timestamp: 1300
    });
  });

  it("emits reread when returning to a previously visited section", () => {
    const analyzer = new AttentionAnalyzer();
    analyzer.setLayouts(layouts);

    analyzer.processSample({ x: 120, y: 100, timestamp: 1000 });
    analyzer.processSample({ x: 120, y: 360, timestamp: 1600 });
    const output = analyzer.processSample({
      x: 130,
      y: 110,
      timestamp: 1600 + gazeHeuristicsConfig.rereadReturnGapMs + 100
    });

    expect(
      output.events.some(
        (event) => event.type === "reread" && event.sectionId === "section-a"
      )
    ).toBe(true);
  });

  it("emits instability after repeated large jumps", () => {
    const analyzer = new AttentionAnalyzer();
    analyzer.setLayouts(layouts);

    let outputEvents: string[] = [];
    let timestamp = 20000;

    analyzer.processSample({ x: 10, y: 10, timestamp });

    for (let i = 0; i < gazeHeuristicsConfig.instabilityJumpCount + 1; i += 1) {
      timestamp += 300;
      const output = analyzer.processSample({
        x: i % 2 === 0 ? 900 : 20,
        y: i % 2 === 0 ? 900 : 20,
        timestamp
      });

      outputEvents = output.events.map((event) => event.type);
      if (outputEvents.includes("instability")) {
        break;
      }
    }

    expect(outputEvents).toContain("instability");
  });
});
