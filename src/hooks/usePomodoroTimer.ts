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
    const [displayTime, setDisplayTime] = useState("00:00");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastTickRef = useRef<number>(Date.now());

    const formatTime = useCallback((seconds: number): string => {
        const mins = Math.floor(Math.max(0, seconds) / 60);
        const secs = Math.max(0, seconds) % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }, []);

    // Calculate actual time remaining based on phaseStartedAt timestamp
    const calculateTimeRemaining = useCallback((sess: PomodoroSessionState): number => {
        if (!sess.phaseStartedAt || sess.phase === "paused" || sess.phase === "idle" || sess.phase === "completed") {
            return sess.timeRemaining;
        }

        const phaseStarted = new Date(sess.phaseStartedAt).getTime();
        const elapsed = Math.floor((Date.now() - phaseStarted) / 1000);

        // Use sess.timeRemaining as the starting point since it preserves
        // the remaining time from when the session was paused/resumed
        return Math.max(0, sess.timeRemaining - elapsed);
    }, []);

    // Check for existing session on mount
    useEffect(() => {
        const stored = getStoredSession();
        if (stored && stored.phase !== "completed" && stored.phase !== "idle") {
            setHasExistingSession(true);

            if (stored.phase === "work" || stored.phase === "break") {
                // Session was running - calculate how much time has passed
                const remaining = calculateTimeRemaining(stored);

                // If time ran out while away, pause and let user decide
                if (remaining <= 0) {
                    setSession({
                        ...stored,
                        timeRemaining: 0,
                        phase: "paused",
                        previousPhase: stored.phase,
                        pausedAt: new Date().toISOString(),
                        phaseStartedAt: undefined,
                    });
                } else {
                    // Pause and show remaining time - user can resume
                    setSession({
                        ...stored,
                        timeRemaining: remaining,
                        phase: "paused",
                        previousPhase: stored.phase,
                        pausedAt: new Date().toISOString(),
                        phaseStartedAt: undefined,
                    });
                }
            } else {
                setSession(stored);
            }
        }
    }, [calculateTimeRemaining]);

    // Handle visibility change (tab hidden/visible, device sleep/wake)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Tab became hidden - the timer will naturally pause due to browser throttling
                // We don't need to do anything special, the timestamp-based calculation handles it
                lastTickRef.current = Date.now();
            } else {
                // Tab became visible - recalculate time
                if (session && (session.phase === "work" || session.phase === "break") && session.phaseStartedAt) {
                    const remaining = calculateTimeRemaining(session);

                    if (remaining <= 0) {
                        // Phase ended while away - trigger transition
                        handlePhaseTransition(session);
                    } else {
                        setDisplayTime(formatTime(remaining));
                    }
                }
                lastTickRef.current = Date.now();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, calculateTimeRemaining, formatTime]);

    // Handle phase transition when timer reaches 0
    const handlePhaseTransition = useCallback((currentSession: PomodoroSessionState) => {
        if (currentSession.phase === "work") {
            // Work -> Break
            const newSession: PomodoroSessionState = {
                ...currentSession,
                phase: "break",
                timeRemaining: currentSession.settings.breakDuration * 60,
                phaseStartedAt: new Date().toISOString(),
            };
            setSession(newSession);
            saveSession(newSession);
            setDisplayTime(formatTime(currentSession.settings.breakDuration * 60));
        } else if (currentSession.phase === "break") {
            // Break -> Work (new cycle)
            const newSession: PomodoroSessionState = {
                ...currentSession,
                phase: "work",
                timeRemaining: currentSession.settings.workDuration * 60,
                currentCycle: currentSession.currentCycle + 1,
                phaseStartedAt: new Date().toISOString(),
            };
            setSession(newSession);
            saveSession(newSession);
            setDisplayTime(formatTime(currentSession.settings.workDuration * 60));
        }
    }, [formatTime]);

    // Timer tick effect - uses timestamps for accurate background timing
    useEffect(() => {
        if (!session || session.phase === "idle" || session.phase === "paused" || session.phase === "completed") {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (session) {
                setDisplayTime(formatTime(session.timeRemaining));
            }
            return;
        }

        // Update display immediately
        const remaining = calculateTimeRemaining(session);
        setDisplayTime(formatTime(remaining));

        intervalRef.current = setInterval(() => {
            const now = Date.now();
            const timeSinceLastTick = now - lastTickRef.current;
            lastTickRef.current = now;

            // If more than 2 seconds since last tick, browser was throttled (background tab)
            // Recalculate from timestamp
            const currentRemaining = calculateTimeRemaining(session);

            if (currentRemaining <= 0) {
                // Time's up - transition phases
                handlePhaseTransition(session);
            } else {
                setDisplayTime(formatTime(currentRemaining));

                // Save periodically (every 10 seconds) to persist state
                if (timeSinceLastTick < 2000 && currentRemaining % 10 === 0) {
                    const updatedSession = { ...session, timeRemaining: currentRemaining };
                    saveSession(updatedSession);
                }
            }
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.phase, session?.phaseStartedAt, calculateTimeRemaining, formatTime, handlePhaseTransition]);

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
            phaseStartedAt: new Date().toISOString(),
        };
        setSession(newSession);
        setHasExistingSession(false);
        saveSession(newSession);
        lastTickRef.current = Date.now();
    }, []);

    const resumeSession = useCallback(() => {
        if (!session || session.phase !== "paused" || !session.previousPhase) return;

        const resumedSession: PomodoroSessionState = {
            ...session,
            phase: session.previousPhase,
            previousPhase: undefined,
            pausedAt: undefined,
            phaseStartedAt: new Date().toISOString(),
            // timeRemaining stays the same - phaseStartedAt is set fresh
        };
        setSession(resumedSession);
        setHasExistingSession(false);
        saveSession(resumedSession);
        lastTickRef.current = Date.now();
    }, [session]);

    const pauseSession = useCallback(() => {
        if (!session || session.phase === "idle" || session.phase === "paused" || session.phase === "completed") return;

        const remaining = calculateTimeRemaining(session);
        const pausedSession: PomodoroSessionState = {
            ...session,
            previousPhase: session.phase,
            phase: "paused",
            pausedAt: new Date().toISOString(),
            phaseStartedAt: undefined,
            timeRemaining: remaining,
        };
        setSession(pausedSession);
        saveSession(pausedSession);
    }, [session, calculateTimeRemaining]);

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

        // Clear the session completely
        setSession(null);
        setHasExistingSession(false);
        saveSession(null);

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

    const isActive = session !== null && session.phase !== "idle" && session.phase !== "completed";

    return {
        session,
        isActive,
        hasExistingSession,
        formattedTime: displayTime,
        startSession,
        resumeSession,
        pauseSession,
        stopSession,
        addPushups,
        discardSession,
        formatTime,
    };
}
