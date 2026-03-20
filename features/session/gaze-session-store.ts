"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AttentionEvent } from "@/types/gaze";
import type {
  HintLog,
  QuizResult,
  SectionAnalytics,
  SessionSnapshot
} from "@/types/session";

interface SessionActions {
  resetSession: () => void;
  initializeLesson: (lessonId: string) => void;
  completeCalibration: (mode: "tracking" | "fallback") => void;
  setCameraStatus: (status: SessionSnapshot["cameraStatus"]) => void;
  setActiveSection: (sectionId: string | null) => void;
  addFocusTime: (sectionId: string, deltaMs: number) => void;
  incrementVisit: (sectionId: string) => void;
  recordAttentionEvent: (event: AttentionEvent) => void;
  logHint: (entry: HintLog) => void;
  dismissHint: (key: string) => void;
  setFocusMode: (enabled: boolean) => void;
  setQuizResult: (result: QuizResult) => void;
  completeSession: () => void;
}

export type SessionStore = SessionSnapshot & SessionActions;

const EMPTY_SECTIONS: Record<string, SectionAnalytics> = {};

const initialSnapshot: SessionSnapshot = {
  lessonId: null,
  mode: "idle",
  cameraStatus: "unknown",
  calibrationCompleted: false,
  startedAt: null,
  endedAt: null,
  activeSectionId: null,
  focusModeEnabled: false,
  focusModeSuggested: false,
  instabilityEvents: 0,
  hintsShown: 0,
  hintsDismissed: {},
  sections: EMPTY_SECTIONS,
  attentionEvents: [],
  hintLogs: [],
  quizResult: null
};

function createSectionAnalytics(sectionId: string): SectionAnalytics {
  return {
    sectionId,
    focusMs: 0,
    visits: 0,
    rereads: 0,
    prolongedFocusCount: 0,
    skipped: false
  };
}

function upsertSection(
  sections: Record<string, SectionAnalytics>,
  sectionId: string
): Record<string, SectionAnalytics> {
  if (sections[sectionId]) {
    return sections;
  }

  return {
    ...sections,
    [sectionId]: createSectionAnalytics(sectionId)
  };
}

export const useGazeSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      ...initialSnapshot,
      resetSession: () => set({ ...initialSnapshot, sections: {} }),
      initializeLesson: (lessonId) =>
        set({
          ...initialSnapshot,
          lessonId,
          sections: {},
          cameraStatus: get().cameraStatus
        }),
      completeCalibration: (mode) =>
        set((state) => ({
          calibrationCompleted: true,
          mode,
          startedAt: state.startedAt ?? Date.now()
        })),
      setCameraStatus: (status) => set({ cameraStatus: status }),
      setActiveSection: (sectionId) => set({ activeSectionId: sectionId }),
      addFocusTime: (sectionId, deltaMs) =>
        set((state) => {
          const nextSections = upsertSection(state.sections, sectionId);
          return {
            sections: {
              ...nextSections,
              [sectionId]: {
                ...nextSections[sectionId],
                focusMs: nextSections[sectionId].focusMs + deltaMs
              }
            }
          };
        }),
      incrementVisit: (sectionId) =>
        set((state) => {
          const nextSections = upsertSection(state.sections, sectionId);
          return {
            sections: {
              ...nextSections,
              [sectionId]: {
                ...nextSections[sectionId],
                visits: nextSections[sectionId].visits + 1
              }
            }
          };
        }),
      recordAttentionEvent: (event) =>
        set((state) => {
          const nextEvents = [...state.attentionEvents, event];

          if (!event.sectionId) {
            return {
              attentionEvents: nextEvents,
              instabilityEvents:
                event.type === "instability"
                  ? state.instabilityEvents + 1
                  : state.instabilityEvents,
              focusModeSuggested:
                event.type === "instability" ? true : state.focusModeSuggested
            };
          }

          const nextSections = upsertSection(state.sections, event.sectionId);
          const currentSection = nextSections[event.sectionId];

          return {
            attentionEvents: nextEvents,
            instabilityEvents:
              event.type === "instability"
                ? state.instabilityEvents + 1
                : state.instabilityEvents,
            focusModeSuggested:
              event.type === "instability" ? true : state.focusModeSuggested,
            sections: {
              ...nextSections,
              [event.sectionId]: {
                ...currentSection,
                skipped:
                  event.type === "skipped_critical"
                    ? true
                    : currentSection.skipped,
                rereads:
                  event.type === "reread"
                    ? currentSection.rereads + 1
                    : currentSection.rereads,
                prolongedFocusCount:
                  event.type === "prolonged_focus"
                    ? currentSection.prolongedFocusCount + 1
                    : currentSection.prolongedFocusCount
              }
            }
          };
        }),
      logHint: (entry) =>
        set((state) => ({
          hintsShown: state.hintsShown + 1,
          hintLogs: [...state.hintLogs, entry]
        })),
      dismissHint: (key) =>
        set((state) => ({
          hintsDismissed: {
            ...state.hintsDismissed,
            [key]: Date.now()
          }
        })),
      setFocusMode: (enabled) => set({ focusModeEnabled: enabled }),
      setQuizResult: (result) => set({ quizResult: result }),
      completeSession: () => set({ endedAt: Date.now() })
    }),
    {
      name: "gazelearn-session",
      partialize: (state) => ({
        lessonId: state.lessonId,
        mode: state.mode,
        cameraStatus: state.cameraStatus,
        calibrationCompleted: state.calibrationCompleted,
        startedAt: state.startedAt,
        endedAt: state.endedAt,
        activeSectionId: state.activeSectionId,
        focusModeEnabled: state.focusModeEnabled,
        focusModeSuggested: state.focusModeSuggested,
        instabilityEvents: state.instabilityEvents,
        hintsShown: state.hintsShown,
        hintsDismissed: state.hintsDismissed,
        sections: state.sections,
        attentionEvents: state.attentionEvents,
        hintLogs: state.hintLogs,
        quizResult: state.quizResult
      })
    }
  )
);
