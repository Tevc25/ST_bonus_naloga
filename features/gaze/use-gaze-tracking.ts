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
  startTracking: () => Promise<GazeTrackingStatus>;
  stopTracking: () => Promise<void>;
}

function classifyTrackingError(error: unknown): {
  status: GazeTrackingStatus;
  message: string;
} {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return {
        status: "denied",
        message: "Camera access denied. Continue in fallback mode."
      };
    }

    if (error.name === "NotFoundError") {
      return {
        status: "unsupported",
        message:
          "No camera device was found. Continue in fallback mode or connect a camera."
      };
    }

    if (error.name === "NotReadableError") {
      return {
        status: "error",
        message:
          "Camera is currently unavailable (possibly used by another app/tab)."
      };
    }

    if (error.name === "SecurityError") {
      return {
        status: "unsupported",
        message: "Eye tracking requires a secure context (HTTPS or localhost)."
      };
    }

    if (error.name === "AbortError") {
      return {
        status: "error",
        message: "Camera initialization was interrupted. Try again."
      };
    }
  }

  if (error instanceof Error) {
    if (error.message.includes("Failed to load WebGazer")) {
      return {
        status: "error",
        message:
          "Eye-tracking library could not be loaded. Check network/ad-block settings."
      };
    }

    if (error.message.includes("window.webgazer")) {
      return {
        status: "error",
        message:
          "Eye-tracking library loaded incorrectly in this browser session."
      };
    }
  }

  return {
    status: "error",
    message: "Unable to start eye tracking in this environment."
  };
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

  const startTracking = useCallback(async (): Promise<GazeTrackingStatus> => {
    if (typeof window === "undefined") {
      return "error";
    }

    if (!window.isSecureContext) {
      if (mountedRef.current) {
        setStatus("unsupported");
        setErrorMessage(
          "Eye tracking requires HTTPS or localhost. Open the app in a secure context."
        );
      }
      return "unsupported";
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
      return "unsupported";
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
      const webgazerWithParams = webgazer as typeof webgazer & {
        params?: {
          faceMeshSolutionPath?: string;
        };
      };

      if (webgazerWithParams.params) {
        webgazerWithParams.params.faceMeshSolutionPath = "/mediapipe/face_mesh";
      }

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
      return "tracking";
    } catch (error) {
      if (mountedRef.current) {
        const classified = classifyTrackingError(error);
        setStatus(classified.status);
        setErrorMessage(classified.message);
        return classified.status;
      }
      return "error";
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
