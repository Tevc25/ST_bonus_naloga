import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AlertProps {
  title: string;
  description: string;
  icon?: ReactNode;
  tone?: "default" | "warning" | "success";
  className?: string;
}

export function Alert({
  title,
  description,
  icon,
  tone = "default",
  className
}: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        tone === "default" && "border-border/80 bg-card/70",
        tone === "warning" && "border-warning/30 bg-warning/10",
        tone === "success" && "border-success/30 bg-success/10",
        className
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        {icon ? <div className="mt-0.5 text-foreground/70">{icon}</div> : null}
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
