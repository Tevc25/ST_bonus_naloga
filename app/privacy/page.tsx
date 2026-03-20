import { Camera, Eye, Keyboard, ShieldCheck } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const commitments = [
  {
    icon: Eye,
    title: "Local processing by default",
    description:
      "Raw gaze coordinates are processed in-browser and stored locally for session analytics only."
  },
  {
    icon: Camera,
    title: "Permission-aware fallback",
    description:
      "If camera access is denied or unavailable, the lesson and summary still work in non-tracking mode."
  },
  {
    icon: ShieldCheck,
    title: "No dark patterns",
    description:
      "Camera access is optional, clearly explained, and never required to complete the learning flow."
  },
  {
    icon: Keyboard,
    title: "Accessible by design",
    description:
      "Keyboard interactions, reduced-motion support, semantic landmarks, and visible focus rings are built in."
  }
];

export default function PrivacyPage() {
  return (
    <PageContainer className="space-y-10 py-12 sm:py-16">
      <div className="space-y-3">
        <Badge>Privacy & Accessibility</Badge>
        <h1 className="text-4xl font-bold tracking-tight">
          Your data and control stay with you
        </h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          GazeLearn is designed for informed consent. The product works without
          camera permission, and every adaptive feature has user control and
          dismiss actions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {commitments.map((item) => (
          <Card key={item.title} className="space-y-3">
            <item.icon className="h-5 w-5 text-success" aria-hidden="true" />
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
