"use client";

import Link from "next/link";
import { BookOpenText, Gauge, ListChecks } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  AdaptiveHintStack,
  type AdaptiveHint
} from "@/features/lesson/adaptive-hint-stack";
import type { Lesson } from "@/types/lesson";
import type { SectionAnalytics } from "@/types/session";

interface LessonReaderProps {
  lesson: Lesson;
  activeSectionId: string | null;
  sectionStats: Record<string, SectionAnalytics>;
  focusModeEnabled: boolean;
  onFocusModeChange: (nextValue: boolean) => void;
  onFinishLesson: () => void;
  registerSectionRef: (
    sectionId: string
  ) => (element: HTMLElement | null) => void;
  hints: AdaptiveHint[];
  onDismissHint: (hintId: string) => void;
}

function computeReadingProgress(
  lesson: Lesson,
  sectionStats: Record<string, SectionAnalytics>
): number {
  const visitedSections = lesson.sections.filter((section) => {
    const stats = sectionStats[section.id];
    if (!stats) {
      return false;
    }

    return stats.focusMs >= 1200 || stats.visits > 0;
  });

  return (visitedSections.length / lesson.sections.length) * 100;
}

export function LessonReader({
  lesson,
  activeSectionId,
  sectionStats,
  focusModeEnabled,
  onFocusModeChange,
  onFinishLesson,
  registerSectionRef,
  hints,
  onDismissHint
}: LessonReaderProps) {
  const progress = computeReadingProgress(lesson, sectionStats);
  const shouldDimPeripheral = focusModeEnabled && activeSectionId !== null;

  return (
    <div className="space-y-6 py-6 sm:py-8" data-testid="lesson-reader">
      <div className="sticky top-16 z-40 border-y border-border/70 bg-background/90 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <p className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:block">
            Reading progress
          </p>
          <Progress value={progress} className="h-2.5" />
          <p className="w-14 text-right text-sm font-semibold text-muted-foreground">
            {Math.round(progress)}%
          </p>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <div className={`space-y-5 ${focusModeEnabled ? "lg:pr-16" : ""}`}>
          <Card
            className={`space-y-4 transition-all duration-300 ${
              shouldDimPeripheral ? "opacity-35 saturate-50" : ""
            }`}
          >
            <Badge>Lesson</Badge>
            <h1 className="text-4xl font-bold tracking-tight">
              {lesson.title}
            </h1>
            <p className="text-lg text-muted-foreground">{lesson.subtitle}</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full bg-muted/70 px-3 py-1">
                <BookOpenText className="h-4 w-4" aria-hidden="true" />
                {lesson.sections.length} sections
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-muted/70 px-3 py-1">
                <Gauge className="h-4 w-4" aria-hidden="true" />
                {lesson.estimatedMinutes} min estimate
              </span>
            </div>
          </Card>

          <article
            className={`space-y-4 ${focusModeEnabled ? "text-[1.08rem] leading-9" : "text-[1.02rem] leading-8"}`}
            aria-label="Lesson content"
          >
            {lesson.sections.map((section, index) => {
              const isActive = activeSectionId === section.id;
              const shouldShadeSection =
                shouldDimPeripheral && !isActive && activeSectionId !== null;
              const activeSectionHints = hints.filter(
                (hint) => !hint.sectionId || hint.sectionId === section.id
              );

              return (
                <section
                  key={section.id}
                  id={section.id}
                  ref={registerSectionRef(section.id)}
                  className={`rounded-3xl border p-6 transition-all duration-300 sm:p-7 ${
                    isActive
                      ? "bg-primary/8 border-primary/60 shadow-soft"
                      : shouldShadeSection
                        ? "border-border/40 bg-card/60 opacity-25 blur-[1px] saturate-50"
                        : "border-border/70 bg-card/80"
                  }`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <header className="mb-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        tone={
                          section.importance === "critical"
                            ? "warning"
                            : "default"
                        }
                      >
                        {section.importance}
                      </Badge>
                      <Badge>Section {index + 1}</Badge>
                    </div>
                    <h2 className="font-serif text-3xl font-semibold tracking-tight">
                      {section.heading}
                    </h2>
                  </header>

                  <div className="space-y-4 text-foreground/95">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {section.keyConcepts.map((concept) => (
                      <span
                        key={concept}
                        className="rounded-full bg-muted/80 px-3 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl border border-border/70 bg-muted/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Difficulty hint
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {section.difficultyHint}
                    </p>
                  </div>

                  {isActive ? (
                    <AdaptiveHintStack
                      hints={activeSectionHints}
                      onDismiss={onDismissHint}
                      showEmptyState={false}
                      className="mt-5"
                    />
                  ) : null}
                </section>
              );
            })}
          </article>

          <Card
            className={`space-y-3 transition-all duration-300 ${
              shouldDimPeripheral ? "opacity-35 saturate-50" : ""
            }`}
          >
            <CardTitle>Ready for your personalized quiz?</CardTitle>
            <CardDescription>
              The quiz targets skipped key sections and topics where attention
              patterns suggested high friction.
            </CardDescription>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={onFinishLesson} data-testid="start-quiz-btn">
                Start Personalized Quiz
              </Button>
              <Button asChild variant="outline">
                <Link href="/privacy">Review privacy details</Link>
              </Button>
            </div>
          </Card>
        </div>

        <aside
          className={`space-y-4 transition-all duration-300 ${
            shouldDimPeripheral ? "opacity-20 blur-[1px] saturate-50" : ""
          }`}
        >
          <Card className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-base">Focus mode</CardTitle>
                <CardDescription>
                  Automatic mode dims everything except your active reading
                  section.
                </CardDescription>
              </div>
              <Switch
                checked={focusModeEnabled}
                onCheckedChange={onFocusModeChange}
              />
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-primary" aria-hidden="true" />
              <CardTitle className="text-base">Section tracker</CardTitle>
            </div>
            <ul className="space-y-2">
              {lesson.sections.map((section) => {
                const stats = sectionStats[section.id];
                const active = activeSectionId === section.id;
                const seen =
                  (stats?.focusMs ?? 0) > 0 || (stats?.visits ?? 0) > 0;
                return (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className={`block rounded-xl px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : seen
                            ? "bg-success/10 text-foreground"
                            : "text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      {section.heading}
                    </a>
                  </li>
                );
              })}
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
