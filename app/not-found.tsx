import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <PageContainer className="py-16">
      <Card className="mx-auto max-w-2xl space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          404
        </p>
        <CardTitle className="text-3xl">Page not found</CardTitle>
        <CardDescription>
          The route you requested does not exist. Return to the homepage or
          continue to the demo lesson.
        </CardDescription>
        <div className="flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/">Back home</Link>
          </Button>
          <Button asChild>
            <Link href="/lesson/demo">Go to lesson</Link>
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
}
