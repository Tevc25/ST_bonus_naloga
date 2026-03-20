"use client";

import { useEffect } from "react";
import { BookOpen, X } from "lucide-react";

import type { DwelledWordInfo } from "@/features/lesson/use-word-dwell";
import { getWordDefinition } from "@/features/lesson/word-definitions";

interface WordPopupProps {
  info: DwelledWordInfo;
  onDismiss: () => void;
}

export function WordPopup({ info, onDismiss }: WordPopupProps) {
  const definition = getWordDefinition(info.word);
  const { rect } = info;

  // Position popup near the word; avoid going off-screen
  const vh = typeof window !== "undefined" ? window.innerHeight : 600;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const popupWidth = 304;

  const left = Math.min(Math.max(rect.left, 12), vw - popupWidth - 12);

  const isInBottomHalf = rect.top > vh * 0.5;
  const topOrBottom = isInBottomHalf
    ? { bottom: vh - rect.top + 10 }
    : { top: rect.bottom + 10 };

  // Dismiss on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onDismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  return (
    <div
      role="dialog"
      aria-label={`Word explanation for "${info.word}"`}
      style={{
        position: "fixed",
        left,
        width: popupWidth,
        zIndex: 60,
        ...topOrBottom
      }}
      className="rounded-2xl border border-amber-200 bg-card shadow-lg ring-1 ring-amber-300/40 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 rounded-t-2xl bg-amber-50/80 px-4 py-2.5 dark:bg-amber-950/30">
        <div className="flex items-center gap-1.5">
          <BookOpen
            className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Word explanation
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="rounded-md p-0.5 text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/40"
          aria-label="Dismiss word explanation"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <p className="text-base font-semibold text-foreground">{info.word}</p>
        {definition ? (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {definition}
          </p>
        ) : (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            You have been focused on this word for a while. If you are unsure of
            its meaning, consider looking it up in a dictionary.
          </p>
        )}
      </div>

      {/* Footer hint */}
      <div className="rounded-b-2xl border-t border-border/50 px-4 py-2">
        <p className="text-[11px] text-muted-foreground/70">
          Press <kbd className="rounded bg-muted px-1 text-[10px]">Esc</kbd> or
          click × to dismiss
        </p>
      </div>
    </div>
  );
}
