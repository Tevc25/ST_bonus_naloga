"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { AdaptiveHint } from "@/features/lesson/adaptive-hint-stack";
import { CalibrationFlow } from "@/features/lesson/calibration-flow";
import { LessonReader } from "@/features/lesson/lesson-reader";
import { AttentionAnalyzer } from "@/features/gaze/attention-analyzer";
import { useGazeTracking } from "@/features/gaze/use-gaze-tracking";
import { PersonalizedQuiz } from "@/features/quiz/personalized-quiz";
import { useGazeSessionStore } from "@/features/session/gaze-session-store";
import type { AttentionEvent, GazePoint, SectionLayout } from "@/types/gaze";
import type { Lesson } from "@/types/lesson";

const HINT_REPEAT_COOLDOWN_MS = 25000;

interface LessonExperienceProps {
  lesson: Lesson;
}

type LessonStep = "calibration" | "reader" | "quiz";

function getHintKind(event: AttentionEvent): AdaptiveHint["kind"] {
  if (event.type === "prolonged_focus") {
    return "stuck";
  }

  if (event.type === "skipped_critical") {
    return "review";
  }

  return "focus";
}

export function LessonExperience({ lesson }: LessonExperienceProps) {
  const router = useRouter();
  const analyzerRef = useRef(new AttentionAnalyzer());
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const activeSectionRef = useRef<string | null>(null);
  const autoFocusAppliedRef = useRef(false);

  const [step, setStep] = useState<LessonStep>("calibration");
  const [hints, setHints] = useState<AdaptiveHint[]>([]);

  const {
    mode,
    sections,
    activeSectionId,
    hintsDismissed,
    focusModeEnabled,
    initializeLesson,
    completeCalibration,
    setCameraStatus,
    setActiveSection,
    incrementVisit,
    addFocusTime,
    recordAttentionEvent,
    logHint,
    dismissHint,
    setFocusMode,
    setQuizResult,
    completeSession,
    ...snapshot
  } = useGazeSessionStore();

  useEffect(() => {
    initializeLesson(lesson.id);
    analyzerRef.current.reset();
    activeSectionRef.current = null;
    autoFocusAppliedRef.current = false;
    setHints([]);
    setStep("calibration");
  }, [initializeLesson, lesson.id]);

  useEffect(() => {
    if (
      step === "reader" &&
      snapshot.focusModeSuggested &&
      !autoFocusAppliedRef.current
    ) {
      autoFocusAppliedRef.current = true;
      setFocusMode(true);
    }
  }, [setFocusMode, snapshot.focusModeSuggested, step]);

  const appendHint = useCallback(
    (event: AttentionEvent) => {
      const section = lesson.sections.find(
        (item) => item.id === event.sectionId
      );
      const hintKey = `${event.type}:${event.sectionId ?? "global"}`;
      const dismissedAt = hintsDismissed[hintKey] ?? 0;

      if (Date.now() - dismissedAt < HINT_REPEAT_COOLDOWN_MS) {
        return;
      }

      const nextHint: AdaptiveHint = {
        id: hintKey,
        kind: getHintKind(event),
        sectionId: event.sectionId,
        title:
          event.type === "prolonged_focus"
            ? `Need a simpler take on ${section?.heading ?? "this concept"}?`
            : event.type === "skipped_critical"
              ? "A key section was skimmed"
              : "Focus appears scattered",
        message:
          event.type === "prolonged_focus"
            ? "You have spent extended focus here. A condensed explanation can reduce cognitive load."
            : event.type === "skipped_critical"
              ? "This section is marked as critical and had limited attention time."
              : "Rapid gaze jumps can signal distraction. Consider enabling focus mode.",
        simplifiedExplanation: section?.simplifiedExplanation,
        shortExample: section?.shortExample,
        whyItMatters: section?.whyItMatters
      };

      setHints((current) => {
        const filtered = current.filter((hint) => hint.id !== nextHint.id);
        return [nextHint, ...filtered].slice(0, 2);
      });

      logHint({
        sectionId: event.sectionId ?? "global",
        kind: nextHint.kind,
        shownAt: Date.now()
      });
    },
    [hintsDismissed, lesson.sections, logHint]
  );

  const handleAnalyzerOutput = useCallback(
    (point: GazePoint) => {
      const output = analyzerRef.current.processSample(point);

      const nextActiveSection = output.activeSectionId ?? null;
      if (nextActiveSection !== activeSectionRef.current) {
        activeSectionRef.current = nextActiveSection;
        setActiveSection(nextActiveSection);
        if (nextActiveSection) {
          incrementVisit(nextActiveSection);
        }
      }

      for (const delta of output.focusDeltas) {
        addFocusTime(delta.sectionId, delta.deltaMs);
      }

      for (const event of output.events) {
        recordAttentionEvent(event);
        appendHint(event);
      }
    },
    [
      addFocusTime,
      appendHint,
      incrementVisit,
      recordAttentionEvent,
      setActiveSection
    ]
  );

  const { status, errorMessage, startTracking, stopTracking } = useGazeTracking(
    {
      onPoint: handleAnalyzerOutput
    }
  );

  useEffect(() => {
    return () => {
      void stopTracking();
    };
  }, [stopTracking]);

  const updateLayouts = useCallback(() => {
    const layouts: SectionLayout[] = lesson.sections
      .map((section, index) => {
        const element = sectionRefs.current[section.id];
        if (!element) {
          return null;
        }

        const rect = element.getBoundingClientRect();

        return {
          id: section.id,
          index,
          importance: section.importance,
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right
        } satisfies SectionLayout;
      })
      .filter((layout): layout is SectionLayout => layout !== null);

    analyzerRef.current.setLayouts(layouts);
  }, [lesson.sections]);

  useEffect(() => {
    if (step !== "reader") {
      return;
    }

    updateLayouts();

    const onLayoutChange = () => updateLayouts();
    window.addEventListener("resize", onLayoutChange);
    window.addEventListener("scroll", onLayoutChange, { passive: true });
    const interval = window.setInterval(updateLayouts, 1500);

    return () => {
      window.removeEventListener("resize", onLayoutChange);
      window.removeEventListener("scroll", onLayoutChange);
      window.clearInterval(interval);
    };
  }, [step, updateLayouts]);

  useEffect(() => {
    if (step !== "reader" || mode !== "fallback") {
      return;
    }

    const updateActiveFromViewport = () => {
      const viewportMid = window.innerHeight * 0.35;
      const candidate = lesson.sections
        .map((section) => {
          const element = sectionRefs.current[section.id];
          if (!element) {
            return null;
          }

          const rect = element.getBoundingClientRect();
          const containsMid =
            rect.top <= viewportMid && rect.bottom >= viewportMid;

          return {
            sectionId: section.id,
            distance: containsMid ? 0 : Math.abs(rect.top - viewportMid)
          };
        })
        .filter(
          (item): item is { sectionId: string; distance: number } =>
            item !== null
        )
        .sort((a, b) => a.distance - b.distance)[0];

      const next = candidate?.sectionId ?? null;
      if (next !== activeSectionRef.current) {
        activeSectionRef.current = next;
        setActiveSection(next);
        if (next) {
          incrementVisit(next);
        }
      }
    };

    const sectionTimer = window.setInterval(() => {
      updateActiveFromViewport();
      if (activeSectionRef.current) {
        addFocusTime(activeSectionRef.current, 1000);
      }
    }, 1000);

    return () => {
      window.clearInterval(sectionTimer);
    };
  }, [
    addFocusTime,
    incrementVisit,
    lesson.sections,
    mode,
    setActiveSection,
    step
  ]);

  const registerSectionRef = useCallback(
    (sectionId: string) => (element: HTMLElement | null) => {
      sectionRefs.current[sectionId] = element;
    },
    []
  );

  const sessionSnapshot = useMemo(
    () => ({
      lessonId: snapshot.lessonId,
      mode,
      cameraStatus: snapshot.cameraStatus,
      calibrationCompleted: snapshot.calibrationCompleted,
      startedAt: snapshot.startedAt,
      endedAt: snapshot.endedAt,
      activeSectionId,
      focusModeEnabled,
      focusModeSuggested: snapshot.focusModeSuggested,
      instabilityEvents: snapshot.instabilityEvents,
      hintsShown: snapshot.hintsShown,
      hintsDismissed,
      sections,
      attentionEvents: snapshot.attentionEvents,
      hintLogs: snapshot.hintLogs,
      quizResult: snapshot.quizResult
    }),
    [
      activeSectionId,
      focusModeEnabled,
      hintsDismissed,
      mode,
      sections,
      snapshot.attentionEvents,
      snapshot.calibrationCompleted,
      snapshot.cameraStatus,
      snapshot.endedAt,
      snapshot.hintLogs,
      snapshot.hintsShown,
      snapshot.instabilityEvents,
      snapshot.lessonId,
      snapshot.quizResult,
      snapshot.startedAt,
      snapshot.focusModeSuggested
    ]
  );

  async function handleEnableTracking() {
    const trackingStatus = await startTracking();
    if (trackingStatus === "tracking") {
      setCameraStatus("granted");
      return true;
    }

    if (trackingStatus === "unsupported") {
      setCameraStatus("unsupported");
    } else {
      setCameraStatus("denied");
    }

    return false;
  }

  function handleStartWithTracking() {
    completeCalibration("tracking");
    setStep("reader");
  }

  function handleStartFallback() {
    completeCalibration("fallback");
    setCameraStatus(status === "unsupported" ? "unsupported" : "denied");
    setStep("reader");
  }

  async function handleFinishReading() {
    completeSession();
    await stopTracking();
    setStep("quiz");
  }

  function handleDismissHint(hintId: string) {
    dismissHint(hintId);
    setHints((current) => current.filter((hint) => hint.id !== hintId));
  }

  if (step === "calibration") {
    return (
      <CalibrationFlow
        status={status}
        errorMessage={errorMessage}
        onEnableTracking={handleEnableTracking}
        onCompleteTrackingCalibration={handleStartWithTracking}
        onContinueFallback={handleStartFallback}
      />
    );
  }

  if (step === "quiz") {
    return (
      <PersonalizedQuiz
        lesson={lesson}
        snapshot={sessionSnapshot}
        onPersistResult={setQuizResult}
        onContinueSummary={() => router.push("/summary")}
      />
    );
  }

  return (
    <LessonReader
      lesson={lesson}
      activeSectionId={activeSectionId}
      sectionStats={sections}
      focusModeEnabled={focusModeEnabled}
      onFocusModeChange={setFocusMode}
      onFinishLesson={handleFinishReading}
      registerSectionRef={registerSectionRef}
      hints={hints}
      onDismissHint={handleDismissHint}
    />
  );
}
