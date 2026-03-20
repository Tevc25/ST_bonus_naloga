"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import type { GazePoint } from "@/types/gaze";

const SCROLL_SPEED_PX = 12;
// User must dwell on button for this long before scroll begins
const DWELL_BEFORE_SCROLL_MS = 400;
// Expands effective hit area to compensate for gaze tracking inaccuracy
const HIT_MARGIN_PX = 60;

interface UseGazeScrollOptions {
  enabled: boolean;
  paused?: boolean;
  upRef: RefObject<HTMLElement | null>;
  downRef: RefObject<HTMLElement | null>;
}

interface UseGazeScrollResult {
  processGazePoint: (point: GazePoint) => void;
  scrollZone: "up" | "down" | null;
}

function isGazeOverElement(
  point: GazePoint,
  ref: RefObject<HTMLElement | null>
): boolean {
  const el = ref.current;
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return (
    point.x >= rect.left - HIT_MARGIN_PX &&
    point.x <= rect.right + HIT_MARGIN_PX &&
    point.y >= rect.top - HIT_MARGIN_PX &&
    point.y <= rect.bottom + HIT_MARGIN_PX
  );
}

export function useGazeScroll({
  enabled,
  paused = false,
  upRef,
  downRef
}: UseGazeScrollOptions): UseGazeScrollResult {
  const rafRef = useRef<number | null>(null);
  const directionRef = useRef<{ dir: "up" | "down"; speed: number } | null>(
    null
  );
  const zoneEntryRef = useRef<{
    zone: "up" | "down";
    since: number;
  } | null>(null);
  const scrollZoneRef = useRef<"up" | "down" | null>(null);
  const [scrollZone, setScrollZone] = useState<"up" | "down" | null>(null);
  const enabledRef = useRef(enabled);
  const pausedRef = useRef(paused);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const setZone = useCallback((zone: "up" | "down" | null) => {
    if (scrollZoneRef.current !== zone) {
      scrollZoneRef.current = zone;
      setScrollZone(zone);
    }
  }, []);

  const stopScroll = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    directionRef.current = null;
    setZone(null);
  }, [setZone]);

  useEffect(() => {
    if (!enabled || paused) stopScroll();
  }, [enabled, paused, stopScroll]);

  useEffect(() => {
    return () => stopScroll();
  }, [stopScroll]);

  const processGazePoint = useCallback(
    (point: GazePoint) => {
      if (
        !enabledRef.current ||
        pausedRef.current ||
        typeof window === "undefined"
      ) {
        stopScroll();
        return;
      }

      let zone: "up" | "down" | null = null;
      if (isGazeOverElement(point, upRef)) zone = "up";
      else if (isGazeOverElement(point, downRef)) zone = "down";

      if (!zone) {
        zoneEntryRef.current = null;
        stopScroll();
        return;
      }

      const now = point.timestamp;

      if (!zoneEntryRef.current || zoneEntryRef.current.zone !== zone) {
        zoneEntryRef.current = { zone, since: now };
        stopScroll();
        return;
      }

      const dwellMs = now - zoneEntryRef.current.since;
      if (dwellMs < DWELL_BEFORE_SCROLL_MS) return;

      if (directionRef.current?.dir === zone) {
        setZone(zone);
        return;
      }

      stopScroll();
      directionRef.current = { dir: zone, speed: SCROLL_SPEED_PX };
      setZone(zone);

      function tick() {
        const active = directionRef.current;
        if (!active) return;
        window.scrollBy({
          top: active.dir === "down" ? active.speed : -active.speed,
          behavior: "instant"
        });
        rafRef.current = requestAnimationFrame(tick);
      }
      rafRef.current = requestAnimationFrame(tick);
    },
    [stopScroll, upRef, downRef, setZone]
  );

  // Mirror mouse position as gaze fallback (webgazer often follows mouse cursor)
  useEffect(() => {
    if (!enabled || paused) return;
    const onMouseMove = (e: MouseEvent) => {
      processGazePoint({ x: e.clientX, y: e.clientY, timestamp: Date.now() });
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [enabled, paused, processGazePoint]);

  return { processGazePoint, scrollZone };
}
