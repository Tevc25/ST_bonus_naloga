import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CalibrationFlow } from "@/features/lesson/calibration-flow";

describe("CalibrationFlow", () => {
  it("allows continuing in fallback mode", async () => {
    const user = userEvent.setup();
    const onFallback = vi.fn();

    render(
      <CalibrationFlow
        status="idle"
        errorMessage={null}
        onEnableTracking={vi.fn().mockResolvedValue(true)}
        onCompleteTrackingCalibration={vi.fn()}
        onContinueFallback={onFallback}
      />
    );

    await user.click(screen.getByTestId("continue-fallback-btn"));

    expect(onFallback).toHaveBeenCalledTimes(1);
  });

  it("requires calibration points before lesson start with tracking", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(
      <CalibrationFlow
        status="tracking"
        errorMessage={null}
        onEnableTracking={vi.fn().mockResolvedValue(true)}
        onCompleteTrackingCalibration={onComplete}
        onContinueFallback={vi.fn()}
      />
    );

    const startButton = screen.getAllByRole("button", {
      name: "Start Lesson"
    })[0];
    expect(startButton).toBeDisabled();

    await user.click(screen.getByTestId("enable-tracking-btn"));

    const calibrationButtons = screen.getAllByRole("button", {
      name: /Calibration point/
    });

    for (const button of calibrationButtons) {
      await user.click(button);
    }

    expect(startButton).toBeEnabled();
  });
});
