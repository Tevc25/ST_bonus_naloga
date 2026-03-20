"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { gazeHeuristicsConfig } from "@/features/gaze/config";
import { loadWebGazerScript } from "@/features/gaze/webgazer-loader";
import type { GazePoint } from "@/types/gaze";

export type GazeTrackingStatus =
  | "idle"
  | "unsupported"
  | "loading"
  | "ready"
  | "tracking"
  | "denied"
  | "error";

interface UseGazeTrackingOptions {
  onPoint: (point: GazePoint) => void;
}

interface UseGazeTrackingResult {
  status: GazeTrackingStatus;
  errorMessage: string | null;
  canTrack: boolean;
  isTracking: boolean;
  startTracking: () => Promise<boolean>;
  stopTracking: () => Promise<void>;
}

export function useGazeTracking({
  onPoint
}: UseGazeTrackingOptions): UseGazeTrackingResult {
  const [status, setStatus] = useState<GazeTrackingStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const lastEmitRef = useRef(0);
  const onPointRef = useRef(onPoint);

  useEffect(() => {
    onPointRef.current = onPoint;
  }, [onPoint]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const webgazer = window.webgazer;
      if (webgazer) {
        void webgazer.end();
      }
    };
  }, []);

  const startTracking = useCallback(async () => {
    if (typeof window === "undefined") {
      return false;
    }

    const hasMediaSupport =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function";

    if (!hasMediaSupport) {
      if (mountedRef.current) {
        setStatus("unsupported");
        setErrorMessage(
          "This browser does not support camera-based eye tracking."
        );
      }
      return false;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user"
        }
      });
      stream.getTracks().forEach((track) => track.stop());

      await loadWebGazerScript();

      if (!window.webgazer) {
        throw new Error("WebGazer was not initialized.");
      }

      const webgazer = window.webgazer;

      webgazer
        .setRegression("ridge")
        .setGazeListener((data) => {
          if (!data) {
            return;
          }

          const now = Date.now();
          if (
            now - lastEmitRef.current <
            gazeHeuristicsConfig.sampleIntervalMs
          ) {
            return;
          }

          lastEmitRef.current = now;
          onPointRef.current({
            x: data.x,
            y: data.y,
            timestamp: now
          });
        })
        .saveDataAcrossSessions(false)
        .showVideoPreview(false)
        .showFaceFeedbackBox(false)
        .showFaceOverlay(false)
        .showPredictionPoints(false);

      await webgazer.begin();

      if (mountedRef.current) {
        setStatus("tracking");
      }
      return true;
    } catch (error) {
      if (mountedRef.current) {
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          setStatus("denied");
          setErrorMessage("Camera access denied. Continue in fallback mode.");
        } else {
          setStatus("error");
          setErrorMessage("Unable to start eye tracking in this environment.");
        }
      }
      return false;
    }
  }, []);

  const stopTracking = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.webgazer) {
      await window.webgazer.end();
      window.webgazer.clearData();
    }

    if (mountedRef.current) {
      setStatus("ready");
    }
  }, []);

  const value = useMemo(
    () => ({
      status,
      errorMessage,
      canTrack:
        status !== "unsupported" && status !== "denied" && status !== "error",
      isTracking: status === "tracking",
      startTracking,
      stopTracking
    }),
    [errorMessage, startTracking, status, stopTracking]
  );

  return value;
}
