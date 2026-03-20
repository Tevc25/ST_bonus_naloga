"use client";

import Link from "next/link";
import { Lightbulb, Sparkles, TriangleAlert, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AdaptiveHint {
  id: string;
  kind: "stuck" | "review" | "focus";
  title: string;
  message: string;
  sectionId?: string;
  simplifiedExplanation?: string;
  shortExample?: string;
  whyItMatters?: string;
}

interface AdaptiveHintStackProps {
  hints: AdaptiveHint[];
  onDismiss: (hintId: string) => void;
  showEmptyState?: boolean;
  className?: string;
}

export function AdaptiveHintStack({
  hints,
  onDismiss,
  showEmptyState = true,
  className
}: AdaptiveHintStackProps) {
  if (hints.length === 0) {
    if (!showEmptyState) {
      return null;
    }

    return (
      <Card>
        <CardTitle className="text-base">Adaptive support</CardTitle>
        <CardDescription className="mt-1">
          Hints will appear here only when attention patterns suggest support
          would help.
        </CardDescription>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {hints.map((hint) => (
        <Card key={hint.id} className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <Badge tone={hint.kind === "review" ? "warning" : "default"}>
                {hint.kind}
              </Badge>
              <CardTitle className="text-base">{hint.title}</CardTitle>
            </div>
            <button
              type="button"
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              onClick={() => onDismiss(hint.id)}
              aria-label="Dismiss hint"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <CardDescription>{hint.message}</CardDescription>
          {hint.simplifiedExplanation ? (
            <div className="rounded-2xl border border-border/80 bg-muted/45 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Lightbulb
                  className="h-4 w-4 text-warning"
                  aria-hidden="true"
                />{" "}
                Simplified explanation
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {hint.simplifiedExplanation}
              </p>
            </div>
          ) : null}
          {hint.shortExample ? (
            <div className="rounded-2xl border border-border/80 bg-muted/45 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />{" "}
                Short example
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {hint.shortExample}
              </p>
            </div>
          ) : null}
          {hint.whyItMatters ? (
            <div className="rounded-2xl border border-border/80 bg-muted/45 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <TriangleAlert
                  className="h-4 w-4 text-success"
                  aria-hidden="true"
                />{" "}
                Why this matters
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {hint.whyItMatters}
              </p>
            </div>
          ) : null}
          {hint.sectionId ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`#${hint.sectionId}`}>Jump to section</Link>
            </Button>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
