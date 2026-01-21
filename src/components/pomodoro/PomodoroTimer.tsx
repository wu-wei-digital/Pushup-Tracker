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

  const phaseColors = {
    work: "text-blue-600",
    break: "text-green-600",
    paused: "text-amber-600",
  };

  const phaseLabels = {
    work: "Focus Time",
    break: "Break Time",
    paused: "Paused",
  };

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
          className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
            isBreak
              ? "bg-green-100 text-green-700"
              : isWork
              ? "bg-blue-100 text-blue-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {phaseLabels[session.phase as keyof typeof phaseLabels] || session.phase}
        </span>
      </div>

      {/* Timer display */}
      <div className={`text-7xl font-bold font-mono ${phaseColors[session.phase as keyof typeof phaseColors] || "text-foreground"}`}>
        {formattedTime}
      </div>

      {/* Cycle counter */}
      <div className="text-sage-600">
        Cycle {session.currentCycle} | Total: {session.totalPushups} pushups
      </div>

      {/* Break-only: Quick add pushups */}
      {isBreak && (
        <div className="bg-green-50 rounded-xl p-4 space-y-3">
          <p className="text-sm text-green-700 font-medium">
            Time to do some pushups!
          </p>
          <div className="flex items-center gap-2 justify-center">
            <Input
              type="number"
              value={quickAddAmount}
              onChange={(e) => setQuickAddAmount(parseInt(e.target.value) || 0)}
              min={1}
              max={100}
              className="w-20 text-center"
            />
            <Button onClick={handleQuickAdd} size="sm">
              + Add Pushups
            </Button>
          </div>
          <div className="flex gap-2 justify-center">
            {[5, 10, 15, 20].map((amount) => (
              <button
                key={amount}
                onClick={() => onAddPushups(amount)}
                className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors"
              >
                +{amount}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Work phase message */}
      {isWork && (
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-700">
            Stay focused! Pushups will be available during breaks.
          </p>
        </div>
      )}

      {/* Paused message */}
      {isPaused && (
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm text-amber-700">
            Session paused. Resume when ready.
          </p>
        </div>
      )}

      {/* Control buttons */}
      <div className="flex gap-3 pt-4">
        {isPaused ? (
          <Button onClick={onResume} className="flex-1">
            Resume
          </Button>
        ) : (
          <Button onClick={onPause} variant="ghost" className="flex-1">
            Pause
          </Button>
        )}
        <Button onClick={onStop} variant="ghost" className="flex-1 text-red-600 hover:bg-red-50">
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
