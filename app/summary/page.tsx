"use client";

import Link from "next/link";

import { SessionSummaryDashboard } from "@/components/analytics/session-summary-dashboard";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getDemoLesson } from "@/features/lesson/lesson-repository";
import { useGazeSessionStore } from "@/features/session/gaze-session-store";

export default function SummaryPage() {
  const snapshot = useGazeSessionStore();
  const lesson = getDemoLesson();

  if (!snapshot.lessonId) {
    return (
      <PageContainer className="py-16">
        <Card className="mx-auto max-w-2xl space-y-3 text-center">
          <CardTitle>No session data yet</CardTitle>
          <CardDescription>
            Complete a demo lesson session to unlock personalized analytics.
          </CardDescription>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link href="/lesson/demo">Start lesson</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SessionSummaryDashboard lesson={lesson} snapshot={snapshot} />
    </PageContainer>
  );
}
