"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import type { PomodoroSettings } from "@/types/pomodoro";
import { DEFAULT_POMODORO_SETTINGS } from "@/types/pomodoro";

interface PomodoroSettingsProps {
  onStart: (settings: PomodoroSettings) => void;
  onCancel: () => void;
}

export default function PomodoroSettings({ onStart, onCancel }: PomodoroSettingsProps) {
  const [workDuration, setWorkDuration] = useState(DEFAULT_POMODORO_SETTINGS.workDuration);
  const [breakDuration, setBreakDuration] = useState(DEFAULT_POMODORO_SETTINGS.breakDuration);
  const [pushupTarget, setPushupTarget] = useState(DEFAULT_POMODORO_SETTINGS.pushupTarget);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({
      workDuration: Math.max(1, Math.min(60, workDuration)),
      breakDuration: Math.max(1, Math.min(30, breakDuration)),
      pushupTarget: Math.max(1, Math.min(100, pushupTarget)),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground">Pomodoro Settings</h3>
        <p className="text-sm text-sage-600 mt-1">
          Configure your work and break intervals
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Work Duration (minutes)
          </label>
          <Input
            type="number"
            value={workDuration}
            onChange={(e) => setWorkDuration(parseInt(e.target.value) || 25)}
            min={1}
            max={60}
          />
          <p className="text-xs text-sage-500 mt-1">How long to focus before a break</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Break Duration (minutes)
          </label>
          <Input
            type="number"
            value={breakDuration}
            onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)}
            min={1}
            max={30}
          />
          <p className="text-xs text-sage-500 mt-1">Time to rest and do pushups</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Pushup Target per Break
          </label>
          <Input
            type="number"
            value={pushupTarget}
            onChange={(e) => setPushupTarget(parseInt(e.target.value) || 10)}
            min={1}
            max={100}
          />
          <p className="text-xs text-sage-500 mt-1">Suggested pushups during each break</p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <button
          type="submit"
          className="flex-1 btn-md rounded-lg bg-coral-500 text-white hover:bg-coral-600 hover:shadow-lg hover:shadow-coral-500/25 active:scale-[0.98] transition-all duration-200 font-medium"
        >
          Start Session
        </button>
      </div>
    </form>
  );
}
