"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import type { PomodoroSessionState } from "@/types/pomodoro";

interface PomodoroTimerProps {
  session: PomodoroSessionState;
  formattedTime: string;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onAddPushups: (amount: number) => void;
}

export default function PomodoroTimer({
    session,
    formattedTime,
    onPause,
    onResume,
    onStop,
    onAddPushups,
}: PomodoroTimerProps) {
    const [quickAddAmount, setQuickAddAmount] = useState(session.settings.pushupTarget);
    const isPaused = session.phase === "paused";
    const isBreak = session.phase === "break";
    const isWork = session.phase === "work";

    const handleQuickAdd = () => {
        if (quickAddAmount > 0) {
            onAddPushups(quickAddAmount);
            setQuickAddAmount(session.settings.pushupTarget);
        }
    };

    return (
        <div className="text-center space-y-6">
            {/* Phase indicator */}
            <div>
                <span
                    className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
                        isBreak
                            ? "bg-coral-100 text-coral-700 border border-coral-200"
                            : isWork
                                ? "bg-sage-100 text-sage-700 border border-sage-200"
                                : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}
                >
                    {isBreak ? "Break Time" : isWork ? "Focus Time" : "Paused"}
                </span>
            </div>

            {/* Timer display */}
            <div className={`text-7xl font-bold font-mono ${
                isBreak ? "text-coral-600" : isWork ? "text-sage-600" : "text-amber-600"
            }`}>
                {formattedTime}
            </div>

            {/* Cycle counter */}
            <div className="text-sage-600">
        Cycle {session.currentCycle} | Total: <span className="font-semibold text-coral-600">{session.totalPushups}</span> pushups
            </div>

            {/* Break-only: Quick add pushups */}
            {isBreak && (
                <div className="bg-coral-50 rounded-xl p-4 space-y-3 border border-coral-100">
                    <p className="text-sm text-coral-700 font-medium">
            Time to do some pushups!
                    </p>
                    <div className="flex items-center gap-2 justify-center">
                        <Input
                            type="number"
                            value={quickAddAmount || ""}
                            onChange={(e) => setQuickAddAmount(e.target.value === "" ? 0 : parseInt(e.target.value))}
                            min={1}
                            max={100}
                            className="w-20 text-center"
                        />
                        <button
                            onClick={handleQuickAdd}
                            className="px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 hover:shadow-lg hover:shadow-coral-500/25 active:scale-[0.98] transition-all duration-200 text-sm font-medium"
                        >
              + Add
                        </button>
                    </div>
                    <div className="flex gap-2 justify-center flex-wrap">
                        {[5, 10, 15, 20].map((amount) => (
                            <button
                                key={amount}
                                onClick={() => onAddPushups(amount)}
                                className="px-3 py-1.5 bg-coral-100 hover:bg-coral-200 text-coral-700 rounded-lg text-sm font-medium transition-colors border border-coral-200"
                            >
                +{amount}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Work phase message */}
            {isWork && (
                <div className="bg-sage-50 rounded-xl p-4 border border-sage-100">
                    <p className="text-sm text-sage-700">
            Stay focused! Pushups will be available during breaks.
                    </p>
                </div>
            )}

            {/* Paused message */}
            {isPaused && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <p className="text-sm text-amber-700">
            Session paused. Resume when ready.
                    </p>
                </div>
            )}

            {/* Control buttons */}
            <div className="flex gap-3 pt-4">
                {isPaused ? (
                    <button
                        onClick={onResume}
                        className="flex-1 btn-md rounded-lg bg-coral-500 text-white hover:bg-coral-600 hover:shadow-lg hover:shadow-coral-500/25 active:scale-[0.98] transition-all duration-200 font-medium"
                    >
            Resume
                    </button>
                ) : (
                    <Button onClick={onPause} variant="ghost" className="flex-1">
            Pause
                    </Button>
                )}
                <Button onClick={onStop} variant="ghost" className="flex-1 !text-coral-600 hover:!bg-coral-50">
          End Session
                </Button>
            </div>

            {/* Session stats */}
            {session.pushupLog.length > 0 && (
                <div className="text-xs text-sage-500 pt-2">
          Pushups per break: {session.pushupLog.join(", ")}
                </div>
            )}
        </div>
    );
}
