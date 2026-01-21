"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  PomodoroSettings,
  PomodoroSessionState,
  PomodoroSummary,
} from "@/types/pomodoro";
import {
  DEFAULT_POMODORO_SETTINGS,
  POMODORO_STORAGE_KEY,
} from "@/types/pomodoro";

const SESSION_EXPIRY_HOURS = 24;

function getStoredSession(): PomodoroSessionState | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(POMODORO_STORAGE_KEY);
    if (!stored) return null;

    const session: PomodoroSessionState = JSON.parse(stored);

    // Check if session is expired (older than 24 hours)
    const startedAt = new Date(session.startedAt).getTime();
    const now = Date.now();
    const hoursSinceStart = (now - startedAt) / (1000 * 60 * 60);

    if (hoursSinceStart > SESSION_EXPIRY_HOURS) {
      localStorage.removeItem(POMODORO_STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

function saveSession(session: PomodoroSessionState | null): void {
  if (typeof window === "undefined") return;

  if (session) {
    localStorage.setItem(POMODORO_STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(POMODORO_STORAGE_KEY);
  }
}

export function usePomodoroTimer() {
  const [session, setSession] = useState<PomodoroSessionState | null>(null);
  const [hasExistingSession, setHasExistingSession] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const stored = getStoredSession();
    if (stored && stored.phase !== "completed" && stored.phase !== "idle") {
      setHasExistingSession(true);
      // Auto-resume if was in work or break phase (not paused)
      if (stored.phase === "work" || stored.phase === "break") {
        // Calculate time elapsed while away
        const pausedAt = stored.pausedAt ? new Date(stored.pausedAt).getTime() : Date.now();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - pausedAt) / 1000);
        const adjustedTime = Math.max(0, stored.timeRemaining - elapsedSeconds);

        setSession({
          ...stored,
          timeRemaining: adjustedTime,
          phase: "paused", // Set to paused so user can resume
          previousPhase: stored.phase,
          pausedAt: new Date().toISOString(),
        });
      } else {
        setSession(stored);
      }
    }
  }, []);

  // Timer tick effect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!session || session.phase === "idle" || session.phase === "paused" || session.phase === "completed") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSession((prev) => {
        if (!prev) return null;

        if (prev.timeRemaining <= 1) {
          // Time's up - transition phases
          if (prev.phase === "work") {
            // Work -> Break
            const newSession: PomodoroSessionState = {
              ...prev,
              phase: "break",
              timeRemaining: prev.settings.breakDuration * 60,
            };
            saveSession(newSession);
            return newSession;
          } else if (prev.phase === "break") {
            // Break -> Work (new cycle)
            const newSession: PomodoroSessionState = {
              ...prev,
              phase: "work",
              timeRemaining: prev.settings.workDuration * 60,
              currentCycle: prev.currentCycle + 1,
            };
            saveSession(newSession);
            return newSession;
          }
        }

        // Normal tick
        const newSession: PomodoroSessionState = {
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        };
        saveSession(newSession);
        return newSession;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [session?.phase]);

  const startSession = useCallback((settings: PomodoroSettings = DEFAULT_POMODORO_SETTINGS) => {
    const newSession: PomodoroSessionState = {
      phase: "work",
      timeRemaining: settings.workDuration * 60,
      currentCycle: 1,
      totalCycles: 0,
      settings,
      totalPushups: 0,
      pushupLog: [],
      startedAt: new Date().toISOString(),
    };
    setSession(newSession);
    setHasExistingSession(false);
    saveSession(newSession);
  }, []);

  const resumeSession = useCallback(() => {
    if (!session || session.phase !== "paused" || !session.previousPhase) return;

    const resumedSession: PomodoroSessionState = {
      ...session,
      phase: session.previousPhase,
      previousPhase: undefined,
      pausedAt: undefined,
    };
    setSession(resumedSession);
    setHasExistingSession(false);
    saveSession(resumedSession);
  }, [session]);

  const pauseSession = useCallback(() => {
    if (!session || session.phase === "idle" || session.phase === "paused" || session.phase === "completed") return;

    const pausedSession: PomodoroSessionState = {
      ...session,
      previousPhase: session.phase,
      phase: "paused",
      pausedAt: new Date().toISOString(),
    };
    setSession(pausedSession);
    saveSession(pausedSession);
  }, [session]);

  const stopSession = useCallback((): PomodoroSummary | null => {
    if (!session) return null;

    const startedAt = new Date(session.startedAt).getTime();
    const now = Date.now();
    const totalTime = Math.floor((now - startedAt) / 1000);

    const cyclesCompleted = session.currentCycle - 1 + (session.phase === "break" || session.phase === "completed" ? 1 : 0);
    const workTime = cyclesCompleted * session.settings.workDuration * 60;
    const breakTime = session.pushupLog.length * session.settings.breakDuration * 60;

    const summary: PomodoroSummary = {
      totalTime,
      totalPushups: session.totalPushups,
      cyclesCompleted: Math.max(cyclesCompleted, session.pushupLog.length > 0 ? 1 : 0),
      workTime,
      breakTime,
      pushupLog: session.pushupLog,
    };

    const completedSession: PomodoroSessionState = {
      ...session,
      phase: "completed",
    };
    setSession(completedSession);
    saveSession(null); // Clear from storage

    return summary;
  }, [session]);

  const addPushups = useCallback((amount: number) => {
    if (!session || session.phase !== "break") return;

    const newSession: PomodoroSessionState = {
      ...session,
      totalPushups: session.totalPushups + amount,
      pushupLog: [...session.pushupLog, amount],
    };
    setSession(newSession);
    saveSession(newSession);
  }, [session]);

  const discardSession = useCallback(() => {
    setSession(null);
    setHasExistingSession(false);
    saveSession(null);
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const formattedTime = session ? formatTime(session.timeRemaining) : "00:00";

  const isActive = session !== null && session.phase !== "idle" && session.phase !== "completed";

  return {
    session,
    isActive,
    hasExistingSession,
    formattedTime,
    startSession,
    resumeSession,
    pauseSession,
    stopSession,
    addPushups,
    discardSession,
    formatTime,
  };
}
