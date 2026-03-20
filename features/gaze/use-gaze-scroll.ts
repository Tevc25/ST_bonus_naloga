"use client";

import { useCallback, useEffect, useRef } from "react";

import type { GazePoint } from "@/types/gaze";

// Top 12% and bottom 18% of viewport trigger scroll
const TOP_ZONE_RATIO = 0.12;
const BOTTOM_ZONE_RATIO = 0.82;
const MIN_SPEED_PX = 3;
const MAX_SPEED_PX = 16;
// User must dwell in zone for this long before scroll begins
const DWELL_BEFORE_SCROLL_MS = 600;

interface UseGazeScrollOptions {
  enabled: boolean;
  paused?: boolean;
}

interface UseGazeScrollResult {
  processGazePoint: (point: GazePoint) => void;
  scrollZone: "up" | "down" | null;
}

export function useGazeScroll({
  enabled,
  paused = false
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
  // We use a ref so processGazePoint closure always reads latest values
  const enabledRef = useRef(enabled);
  const pausedRef = useRef(paused);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const stopScroll = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    directionRef.current = null;
    scrollZoneRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled || paused) stopScroll();
  }, [enabled, paused, stopScroll]);

  useEffect(() => {
    return () => stopScroll();
  }, [stopScroll]);

  const processGazePoint = useCallback(
    (point: GazePoint) => {
      if (!enabledRef.current || pausedRef.current || typeof window === "undefined") {
        stopScroll();
        return;
      }

      const vh = window.innerHeight;
      const ny = point.y / vh;

      let zone: "up" | "down" | null = null;
      if (ny < TOP_ZONE_RATIO) zone = "up";
      else if (ny > BOTTOM_ZONE_RATIO) zone = "down";

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

      // Speed proportional to how deep into the zone the gaze is
      const depth =
        zone === "up"
          ? 1 - ny / TOP_ZONE_RATIO
          : (ny - BOTTOM_ZONE_RATIO) / (1 - BOTTOM_ZONE_RATIO);
      const speed =
        MIN_SPEED_PX + Math.min(depth, 1) * (MAX_SPEED_PX - MIN_SPEED_PX);

      // If already scrolling in the same direction, just update speed
      if (directionRef.current?.dir === zone) {
        directionRef.current.speed = speed;
        scrollZoneRef.current = zone;
        return;
      }

      stopScroll();
      directionRef.current = { dir: zone, speed };
      scrollZoneRef.current = zone;

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
    [stopScroll]
  );

  return { processGazePoint, scrollZone: scrollZoneRef.current };
}
