"use client";

import Link from "next/link";
import { BarChart3, Brain, Eye, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { buildSessionSummary } from "@/features/analytics/session-summary";
import { formatDuration, formatPercent } from "@/lib/format";
import type { Lesson } from "@/types/lesson";
import type { SessionSnapshot } from "@/types/session";

interface SessionSummaryDashboardProps {
  lesson: Lesson;
  snapshot: SessionSnapshot;
}

function getSectionName(lesson: Lesson, sectionId: string): string {
  return (
    lesson.sections.find((section) => section.id === sectionId)?.heading ??
    sectionId
  );
}

export function SessionSummaryDashboard({
  lesson,
  snapshot
}: SessionSummaryDashboardProps) {
  const summary = buildSessionSummary(snapshot, lesson);

  const sectionRows = lesson.sections.map((section) => {
    const stats = snapshot.sections[section.id];
    return {
      id: section.id,
      title: section.heading,
      focusMs: stats?.focusMs ?? 0
    };
  });

  const totalFocus = sectionRows.reduce((acc, row) => acc + row.focusMs, 0);

  return (
    <div
      className="mx-auto w-full max-w-6xl space-y-6 py-10"
      data-testid="summary-dashboard"
    >
      <Card className="space-y-3">
        <Badge>Session Summary</Badge>
        <h1 className="text-4xl font-bold tracking-tight">
          Learning analytics overview
        </h1>
        <CardDescription>
          Review where attention was strong, where support appeared, and how you
          performed on the personalized quiz.
        </CardDescription>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="space-y-2">
          <Eye className="h-4 w-4 text-primary" aria-hidden="true" />
          <CardTitle className="text-base">Total reading time</CardTitle>
          <p className="text-2xl font-semibold">
            {formatDuration(summary.totalReadingMs)}
          </p>
        </Card>
        <Card className="space-y-2">
          <Sparkles className="h-4 w-4 text-warning" aria-hidden="true" />
          <CardTitle className="text-base">Adaptive hints shown</CardTitle>
          <p className="text-2xl font-semibold">{summary.hintsShown}</p>
        </Card>
        <Card className="space-y-2">
          <BarChart3 className="h-4 w-4 text-success" aria-hidden="true" />
          <CardTitle className="text-base">Focus instability events</CardTitle>
          <p className="text-2xl font-semibold">{summary.instabilityEvents}</p>
        </Card>
        <Card className="space-y-2">
          <Brain className="h-4 w-4 text-primary" aria-hidden="true" />
          <CardTitle className="text-base">Quiz score</CardTitle>
          <p className="text-2xl font-semibold">
            {summary.quizScore !== null && summary.quizTotal !== null
              ? `${summary.quizScore}/${summary.quizTotal}`
              : "Not completed"}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <Card className="space-y-3">
          <CardTitle>Attention heatmap by section</CardTitle>
          <CardDescription>
            Relative focus time per section across this session.
          </CardDescription>
          <div className="space-y-3">
            {sectionRows.map((row) => {
              const width =
                totalFocus > 0 ? (row.focusMs / totalFocus) * 100 : 0;
              return (
                <div key={row.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{row.title}</span>
                    <span className="font-medium text-muted-foreground">
                      {formatPercent(width)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted/70">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <CardTitle>Most viewed sections</CardTitle>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {summary.mostViewedSectionIds.length > 0 ? (
                summary.mostViewedSectionIds.map((sectionId) => (
                  <li key={sectionId}>{getSectionName(lesson, sectionId)}</li>
                ))
              ) : (
                <li>No dominant sections recorded.</li>
              )}
            </ul>
          </div>

          <div>
            <CardTitle>Skipped important sections</CardTitle>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {summary.skippedCriticalSectionIds.length > 0 ? (
                summary.skippedCriticalSectionIds.map((sectionId) => (
                  <li key={sectionId}>{getSectionName(lesson, sectionId)}</li>
                ))
              ) : (
                <li>None detected.</li>
              )}
            </ul>
          </div>

          <div>
            <CardTitle>Repeated attention sections</CardTitle>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {summary.repeatedAttentionSectionIds.length > 0 ? (
                summary.repeatedAttentionSectionIds.map((sectionId) => (
                  <li key={sectionId}>{getSectionName(lesson, sectionId)}</li>
                ))
              ) : (
                <li>None detected.</li>
              )}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild variant="outline">
              <Link href="/lesson/demo">Start another session</Link>
            </Button>
            <Button asChild>
              <Link href="/">Return home</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
