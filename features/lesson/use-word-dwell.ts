"use client";

import { useCallback, useRef, useState } from "react";

import type { GazePoint } from "@/types/gaze";

const WORD_DWELL_MS = 15_000;

export interface DwelledWordInfo {
  word: string;
  rect: DOMRect;
}

export interface UseWordDwellResult {
  processGazePoint: (point: GazePoint) => void;
  dwelledWord: DwelledWordInfo | null;
  dismissPopup: () => void;
}

export function useWordDwell(): UseWordDwellResult {
  const [dwelledWord, setDwelledWord] = useState<DwelledWordInfo | null>(null);
  const currentRef = useRef<{ el: HTMLElement; since: number } | null>(null);
  // WeakSet so elements can be GC'd when removed from DOM
  const triggeredRef = useRef<WeakSet<HTMLElement>>(new WeakSet());
  const highlightedEls = useRef<Set<HTMLElement>>(new Set());

  const processGazePoint = useCallback((point: GazePoint) => {
    if (typeof document === "undefined") return;

    const el = document.elementFromPoint(point.x, point.y);

    if (!(el instanceof HTMLElement) || !("gazeWord" in el.dataset)) {
      currentRef.current = null;
      return;
    }

    const now = point.timestamp;

    if (currentRef.current?.el !== el) {
      currentRef.current = { el, since: now };
      return;
    }

    const dwell = now - currentRef.current.since;

    if (dwell >= WORD_DWELL_MS && !triggeredRef.current.has(el)) {
      triggeredRef.current.add(el);
      const word = el.dataset.gazeWord ?? "";
      const rect = el.getBoundingClientRect();

      // Highlight the word in the text
      el.style.backgroundColor = "rgba(253, 224, 71, 0.65)";
      el.style.borderRadius = "3px";
      el.style.transition = "background-color 0.3s";
      highlightedEls.current.add(el);

      setDwelledWord({ word, rect });
    }
  }, []);

  const dismissPopup = useCallback(() => {
    setDwelledWord(null);
    // Remove highlights when popup is dismissed
    for (const el of highlightedEls.current) {
      el.style.backgroundColor = "";
      el.style.borderRadius = "";
    }
    highlightedEls.current.clear();
  }, []);

  return { processGazePoint, dwelledWord, dismissPopup };
}
