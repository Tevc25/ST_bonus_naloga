"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, CircleX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/lib/format";
import type { Lesson } from "@/types/lesson";
import type { QuizResult, SessionSnapshot } from "@/types/session";
import {
  buildPersonalizedQuiz,
  scoreQuiz
} from "@/features/quiz/personalization";

interface PersonalizedQuizProps {
  lesson: Lesson;
  snapshot: SessionSnapshot;
  onPersistResult: (result: QuizResult) => void;
  onContinueSummary: () => void;
}

export function PersonalizedQuiz({
  lesson,
  snapshot,
  onPersistResult,
  onContinueSummary
}: PersonalizedQuizProps) {
  const personalizedQuiz = useMemo(
    () => buildPersonalizedQuiz(lesson, snapshot, { maxQuestions: 6 }),
    [lesson, snapshot]
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    if (!submitted) {
      return null;
    }
    return scoreQuiz(personalizedQuiz.items, answers);
  }, [answers, personalizedQuiz.items, submitted]);

  function handleSubmit() {
    if (personalizedQuiz.items.length === 0) {
      return;
    }

    setSubmitted(true);
    const scoreResult = scoreQuiz(personalizedQuiz.items, answers);

    onPersistResult({
      score: scoreResult.score,
      total: scoreResult.total,
      answers,
      completedAt: Date.now(),
      questionIds: personalizedQuiz.items.map((item) => item.question.id)
    });
  }

  if (personalizedQuiz.items.length === 0) {
    return (
      <Card className="mx-auto mt-10 max-w-2xl space-y-3">
        <CardTitle>No quiz items available</CardTitle>
        <CardDescription>
          We could not generate quiz questions for this session. Continue to
          your summary dashboard.
        </CardDescription>
        <Button onClick={onContinueSummary}>Open summary</Button>
      </Card>
    );
  }

  return (
    <div
      className="mx-auto mt-8 w-full max-w-4xl space-y-6 pb-8"
      data-testid="personalized-quiz"
    >
      <Card className="space-y-3">
        <Badge>Personalized Quiz</Badge>
        <h2 className="text-3xl font-bold tracking-tight">
          Targeted review based on your session
        </h2>
        <CardDescription>
          Questions are selected from skipped or high-friction sections first,
          then coverage topics.
        </CardDescription>
      </Card>

      {personalizedQuiz.items.map((item, index) => {
        const selected = answers[item.question.id];
        return (
          <Card key={item.question.id} className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge>{`Q${index + 1}`}</Badge>
              <Badge tone={item.reason === "skipped" ? "warning" : "default"}>
                {item.reason}
              </Badge>
            </div>
            <CardTitle className="text-base">{item.question.prompt}</CardTitle>
            <div
              className="space-y-2"
              role="radiogroup"
              aria-label={item.question.prompt}
            >
              {item.question.choices.map((choice) => {
                const checked = selected === choice.id;
                return (
                  <label
                    key={choice.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 text-sm transition-colors ${
                      checked
                        ? "border-primary bg-primary/10"
                        : "border-border/70 bg-card/65 hover:bg-muted/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name={item.question.id}
                      value={choice.id}
                      checked={checked}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          [item.question.id]: choice.id
                        }))
                      }
                    />
                    <span>{choice.text}</span>
                  </label>
                );
              })}
            </div>
            {submitted && result ? (
              <div className="rounded-2xl border border-border/80 bg-muted/35 p-3">
                <p className="text-sm font-semibold">
                  {answers[item.question.id] ===
                  item.question.correctChoiceId ? (
                    <span className="inline-flex items-center gap-1 text-success">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />{" "}
                      Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-warning">
                      <CircleX className="h-4 w-4" aria-hidden="true" /> Review
                      this concept
                    </span>
                  )}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.question.explanation}
                </p>
                <Link
                  href={`/lesson/demo#${item.question.sectionId}`}
                  className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline"
                >
                  Return to related section
                </Link>
              </div>
            ) : null}
          </Card>
        );
      })}

      {!submitted ? (
        <Button onClick={handleSubmit} data-testid="submit-quiz-btn">
          Submit quiz
        </Button>
      ) : null}

      {submitted && result ? (
        <Card className="space-y-3" data-testid="quiz-result">
          <CardTitle className="text-2xl">Quiz complete</CardTitle>
          <CardDescription>
            Score: {result.score}/{result.total} (
            {formatPercent((result.score / result.total) * 100)})
          </CardDescription>
          <Button onClick={onContinueSummary}>
            Open session summary{" "}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Card>
      ) : null}
    </div>
  );
}
