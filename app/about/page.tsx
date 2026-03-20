import { Eye, Gauge, ShieldCheck, Waypoints } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const steps = [
  {
    icon: Eye,
    title: "1. Capture local gaze samples",
    description:
      "WebGazer estimates viewport coordinates in the browser with throttled updates."
  },
  {
    icon: Waypoints,
    title: "2. Analyze attention heuristics",
    description:
      "A dedicated analyzer detects prolonged focus, skip patterns, instability, and re-reading."
  },
  {
    icon: Gauge,
    title: "3. Adapt content support",
    description:
      "The reader shows contextual hints and offers focus mode when attention quality declines."
  },
  {
    icon: ShieldCheck,
    title: "4. Preserve privacy",
    description:
      "Session analytics live in local state and local storage unless you explicitly export data."
  }
];

export default function AboutPage() {
  return (
    <PageContainer className="space-y-10 py-12 sm:py-16">
      <div className="space-y-3">
        <Badge>How It Works</Badge>
        <h1 className="text-4xl font-bold tracking-tight">
          GazeLearn System Overview
        </h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          The app combines client-side eye tracking, deterministic heuristics,
          adaptive reading UI, and targeted assessment to support difficult
          educational content while respecting user autonomy and privacy.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {steps.map((step) => (
          <Card key={step.title} className="space-y-3">
            <step.icon className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle>{step.title}</CardTitle>
            <CardDescription>{step.description}</CardDescription>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
