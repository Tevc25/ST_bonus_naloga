import Link from "next/link";
import {
  Activity,
  BrainCircuit,
  Focus,
  Lock,
  UserRoundCheck
} from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Hero } from "@/components/marketing/hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    icon: Activity,
    title: "Live attention analytics",
    description:
      "Tracks active reading zones, instability, re-reading, and skipped key sections."
  },
  {
    icon: BrainCircuit,
    title: "Adaptive explanations",
    description:
      "Offers simplified context, examples, and relevance when a concept appears difficult."
  },
  {
    icon: Focus,
    title: "Useful focus mode",
    description:
      "Reduces distraction and improves readability when focus appears to drop."
  },
  {
    icon: UserRoundCheck,
    title: "Personalized quiz",
    description:
      "Asks targeted questions based on your attention profile and section friction."
  }
];

export default function HomePage() {
  return (
    <PageContainer className="space-y-16 py-12 sm:py-16">
      <Hero />

      <section className="space-y-6" aria-labelledby="product-features">
        <div className="space-y-2">
          <Badge>Core Product</Badge>
          <h2
            id="product-features"
            className="text-3xl font-semibold tracking-tight"
          >
            Built for deep reading and actionable feedback
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {highlights.map((item) => (
            <Card key={item.title} className="space-y-2">
              <item.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      <section
        className="grid gap-4 lg:grid-cols-2"
        aria-labelledby="privacy-accessibility"
      >
        <Card className="space-y-3">
          <Lock className="h-5 w-5 text-success" aria-hidden="true" />
          <CardTitle id="privacy-accessibility">Privacy by design</CardTitle>
          <CardDescription>
            Camera data and gaze coordinates are processed client-side and
            remain local by default. You can continue entirely in fallback mode
            without granting camera permission.
          </CardDescription>
          <Button asChild variant="outline">
            <Link href="/privacy">Read privacy details</Link>
          </Button>
        </Card>
        <Card className="space-y-3">
          <Focus className="h-5 w-5 text-primary" aria-hidden="true" />
          <CardTitle>Accessibility-first interaction</CardTitle>
          <CardDescription>
            Keyboard navigable controls, semantic structure, reduced motion
            support, clear focus states, and high-contrast visuals are included
            from the start.
          </CardDescription>
          <Button asChild variant="outline">
            <Link href="/about">See how it works</Link>
          </Button>
        </Card>
      </section>
    </PageContainer>
  );
}
