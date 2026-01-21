"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui";
import { usePomodoroTimer } from "@/hooks/usePomodoroTimer";
import type { PomodoroSettings, PomodoroSummary as PomodoroSummaryType } from "@/types/pomodoro";
import PomodoroSettingsView from "./PomodoroSettings";
import PomodoroTimer from "./PomodoroTimer";
import PomodoroSummary from "./PomodoroSummary";

type ViewState = "settings" | "timer" | "summary" | "resume-prompt";

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (totalPushups: number) => Promise<void>;
}

export default function PomodoroModal({ isOpen, onClose, onComplete }: PomodoroModalProps) {
    const {
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
    } = usePomodoroTimer();

    const [view, setView] = useState<ViewState>("settings");
    const [summary, setSummary] = useState<PomodoroSummaryType | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const hasInitialized = useRef(false);

    // Initialize view based on session state (only on mount or when modal opens)
    useEffect(() => {
        if (!isOpen) {
            hasInitialized.current = false;
            return;
        }

        // Don't reinitialize if we're showing summary
        if (summary) {
            setView("summary");
            return;
        }

        if (hasExistingSession && session && session.phase === "paused") {
            setView("resume-prompt");
            hasInitialized.current = true;
        } else if (isActive && session) {
            setView("timer");
            hasInitialized.current = true;
        } else if (!hasInitialized.current) {
            // Only reset to settings if we haven't initialized yet
            setView("settings");
            hasInitialized.current = true;
        }
    }, [isOpen, hasExistingSession, isActive, session, summary]);

    // When session becomes active, switch to timer view
    useEffect(() => {
        if (isActive && session && view !== "timer") {
            setView("timer");
        }
    }, [isActive, session, view]);

    const handleStart = (settings: PomodoroSettings) => {
        startSession(settings);
        setView("timer");
    };

    const handleResume = () => {
        resumeSession();
        setView("timer");
    };

    const handleStartNew = () => {
        discardSession();
        setSummary(null);
        setView("settings");
    };

    const handleStop = () => {
        const sessionSummary = stopSession();
        if (sessionSummary) {
            setSummary(sessionSummary);
            setView("summary");
        }
    };

    const handleConfirmUpload = async () => {
        if (!summary || summary.totalPushups === 0) return;

        setIsSubmitting(true);
        try {
            await onComplete(summary.totalPushups);
            setSummary(null);
            hasInitialized.current = false;
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDiscard = () => {
        setSummary(null);
        discardSession();
        hasInitialized.current = false;
        onClose();
    };

    const handleClose = () => {
    // If session is active, just minimize (close modal but keep session running)
        if (isActive) {
            onClose();
            return;
        }
        // If showing summary, keep it (user clicked backdrop)
        if (summary) {
            return;
        }
        // Otherwise, full close
        discardSession();
        hasInitialized.current = false;
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl border border-sage-100 shadow-lg shadow-sage-500/10 w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
                {/* Coral accent bar at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-coral-400 via-coral-500 to-coral-600 rounded-t-2xl" />

                {/* Close button - only show if not in summary view */}
                {view !== "summary" && (
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-sage-400 hover:text-sage-600 transition-colors"
                        aria-label="Close"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}

                {/* Pomodoro icon */}
                <div className="text-center mb-4 mt-2">
                    <span className="text-4xl">🍅</span>
                </div>

                {/* Views */}
                {view === "settings" && (
                    <PomodoroSettingsView onStart={handleStart} onCancel={handleClose} />
                )}

                {view === "resume-prompt" && (
                    <div className="text-center space-y-6">
                        <h3 className="text-lg font-semibold text-foreground">
              Resume Previous Session?
                        </h3>
                        <p className="text-sm text-sage-600">
              You have an active pomodoro session. Would you like to continue?
                        </p>
                        {session && (
                            <div className="bg-coral-50 rounded-xl p-4 text-sm text-coral-700 border border-coral-100">
                                <div className="font-medium">Cycle {session.currentCycle}</div>
                                <div>{session.totalPushups} pushups logged</div>
                                <div className="text-coral-600 mt-1">
                                    {Math.floor(session.timeRemaining / 60)}:{(session.timeRemaining % 60).toString().padStart(2, "0")} remaining
                                </div>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <Button onClick={handleStartNew} variant="ghost" className="flex-1">
                Start New
                            </Button>
                            <button
                                onClick={handleResume}
                                className="flex-1 btn-md rounded-lg bg-coral-500 text-white hover:bg-coral-600 hover:shadow-lg hover:shadow-coral-500/25 active:scale-[0.98] transition-all duration-200 font-medium"
                            >
                Resume
                            </button>
                        </div>
                    </div>
                )}

                {view === "timer" && session && (
                    <PomodoroTimer
                        session={session}
                        formattedTime={formattedTime}
                        onPause={pauseSession}
                        onResume={resumeSession}
                        onStop={handleStop}
                        onAddPushups={addPushups}
                    />
                )}

                {view === "summary" && summary && (
                    <PomodoroSummary
                        summary={summary}
                        onConfirm={handleConfirmUpload}
                        onDiscard={handleDiscard}
                        isSubmitting={isSubmitting}
                    />
                )}
            </div>
        </div>
    );
}
