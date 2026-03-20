"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function Hero() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="space-y-6"
      >
        <p className="inline-flex items-center rounded-full border border-border/80 bg-card/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Attention-Aware Education
        </p>
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Learn deeper with real-time gaze-aware study guidance.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
          GazeLearn detects where attention drops, where concepts feel
          difficult, and where key sections are skipped. It responds with subtle
          support, personalized quizzes, and accessibility-first focus tools.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href="/lesson/demo">Start Demo Lesson</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/privacy">Privacy Model</Link>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      >
        <Card className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl bg-muted/70 p-3">
            <Eye className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="text-sm font-medium">
              Section-level gaze tracking stays on your device
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-muted/70 p-3">
            <Sparkles className="h-5 w-5 text-warning" aria-hidden="true" />
            <p className="text-sm font-medium">
              Adaptive hints appear only when useful
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-muted/70 p-3">
            <ShieldCheck className="h-5 w-5 text-success" aria-hidden="true" />
            <p className="text-sm font-medium">
              Fallback mode works without camera permission
            </p>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
