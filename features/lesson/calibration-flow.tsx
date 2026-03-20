"use client";

import { useMemo, useState } from "react";
import { Camera, CircleAlert, Eye, RefreshCcw } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { GazeTrackingStatus } from "@/features/gaze/use-gaze-tracking";

interface CalibrationFlowProps {
  status: GazeTrackingStatus;
  errorMessage: string | null;
  onEnableTracking: () => Promise<boolean>;
  onCompleteTrackingCalibration: () => void;
  onContinueFallback: () => void;
}

const calibrationPoints = Array.from({ length: 9 }, (_, index) => ({
  id: `point-${index}`,
  row: Math.floor(index / 3),
  col: index % 3
}));

export function CalibrationFlow({
  status,
  errorMessage,
  onEnableTracking,
  onCompleteTrackingCalibration,
  onContinueFallback
}: CalibrationFlowProps) {
  const [enabled, setEnabled] = useState(false);
  const [clickedPointIds, setClickedPointIds] = useState<string[]>([]);

  const progressPercent = useMemo(
    () => (clickedPointIds.length / calibrationPoints.length) * 100,
    [clickedPointIds.length]
  );

  const allPointsCompleted =
    clickedPointIds.length === calibrationPoints.length;
  const canUseTracking = status === "tracking" && enabled;

  async function handleEnableTracking() {
    const started = await onEnableTracking();
    setEnabled(started);
    if (!started) {
      setClickedPointIds([]);
    }
  }

  function handlePointClick(pointId: string) {
    if (!canUseTracking || clickedPointIds.includes(pointId)) {
      return;
    }

    setClickedPointIds((current) => [...current, pointId]);
  }

  function resetCalibration() {
    setClickedPointIds([]);
  }

  return (
    <div
      className="mx-auto w-full max-w-5xl space-y-6 py-10 sm:py-14"
      data-testid="calibration-flow"
    >
      <div className="space-y-3">
        <Badge>Calibration</Badge>
        <h1 className="text-4xl font-bold tracking-tight">
          Prepare eye tracking for this lesson
        </h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          Gaze tracking is optional. Data is processed in your browser and used
          only for in-session adaptation. You can continue in fallback mode at
          any time.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-xl">Guided Calibration</CardTitle>
            <Badge>{Math.round(progressPercent)}% complete</Badge>
          </div>
          <CardDescription>
            Enable camera tracking, then click each target point once while
            looking directly at it.
          </CardDescription>
          <Progress value={progressPercent} />

          <div
            className="grid min-h-[320px] grid-cols-3 gap-8 rounded-3xl border border-border/80 bg-muted/35 p-8"
            aria-label="Calibration target grid"
          >
            {calibrationPoints.map((point) => {
              const isClicked = clickedPointIds.includes(point.id);
              return (
                <button
                  key={point.id}
                  type="button"
                  aria-label={`Calibration point ${point.row + 1}-${point.col + 1}`}
                  className={`mx-auto h-9 w-9 rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                    isClicked
                      ? "border-success bg-success/70"
                      : "border-primary/60 bg-primary/15 hover:bg-primary/25"
                  }`}
                  onClick={() => handlePointClick(point.id)}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleEnableTracking}
              disabled={status === "loading"}
              data-testid="enable-tracking-btn"
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
              {status === "loading"
                ? "Starting camera..."
                : "Enable Camera Tracking"}
            </Button>
            <Button
              variant="outline"
              onClick={resetCalibration}
              disabled={!canUseTracking}
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Recalibrate
            </Button>
            <Button
              variant="secondary"
              onClick={onContinueFallback}
              data-testid="continue-fallback-btn"
            >
              Continue Without Camera
            </Button>
            <Button
              variant="primary"
              onClick={onCompleteTrackingCalibration}
              disabled={!allPointsCompleted || !canUseTracking}
            >
              Start Lesson
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-base">Status</CardTitle>
            </div>
            <CardDescription>
              {status === "tracking" &&
                "Tracking active. Complete the target grid to continue."}
              {status === "idle" &&
                "Tracking is idle. Start when you are ready."}
              {status === "loading" &&
                "Requesting camera access and loading WebGazer."}
              {status === "unsupported" &&
                "This browser cannot provide camera eye tracking."}
              {status === "denied" &&
                "Camera permission denied. Use fallback mode to continue."}
              {status === "error" &&
                "Unable to initialize tracking in this environment."}
              {status === "ready" && "Tracking is ready to begin."}
            </CardDescription>
          </Card>

          {errorMessage ? (
            <Alert
              title="Tracking unavailable"
              description={errorMessage}
              icon={<CircleAlert className="h-4 w-4" />}
              tone="warning"
            />
          ) : null}

          <Card className="space-y-3">
            <CardTitle className="text-base">Privacy note</CardTitle>
            <CardDescription>
              Gaze coordinates and calibration state are used locally for
              adaptive lesson support and are not transmitted by default.
            </CardDescription>
          </Card>
        </div>
      </div>
    </div>
  );
}
