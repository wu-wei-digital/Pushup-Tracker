"use client";

import { Button } from "@/components/ui";
import type { PomodoroSummary as PomodoroSummaryType } from "@/types/pomodoro";

interface PomodoroSummaryProps {
  summary: PomodoroSummaryType;
  onConfirm: () => void;
  onDiscard: () => void;
  isSubmitting?: boolean;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export default function PomodoroSummary({
  summary,
  onConfirm,
  onDiscard,
  isSubmitting = false,
}: PomodoroSummaryProps) {
  const hasNoPushups = summary.totalPushups === 0;

  return (
    <div className="text-center space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Session Complete!</h3>
        <p className="text-sm text-sage-600 mt-1">
          Great work! Here&apos;s your summary.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-sage-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-primary-600">
            {summary.totalPushups}
          </div>
          <div className="text-sm text-sage-600">Total Pushups</div>
        </div>
        <div className="bg-sage-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-primary-600">
            {summary.cyclesCompleted}
          </div>
          <div className="text-sm text-sage-600">Cycles Completed</div>
        </div>
        <div className="bg-sage-50 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-600">
            {formatDuration(summary.workTime)}
          </div>
          <div className="text-sm text-sage-600">Focus Time</div>
        </div>
        <div className="bg-sage-50 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600">
            {formatDuration(summary.breakTime)}
          </div>
          <div className="text-sm text-sage-600">Break Time</div>
        </div>
      </div>

      {/* Pushup breakdown */}
      {summary.pushupLog.length > 0 && (
        <div className="text-sm text-sage-600">
          <span className="font-medium">Pushups per break:</span>{" "}
          {summary.pushupLog.join(", ")}
        </div>
      )}

      {/* Total session time */}
      <div className="text-sm text-sage-500">
        Total session time: {formatDuration(summary.totalTime)}
      </div>

      {/* Action buttons */}
      <div className="space-y-3 pt-4">
        {hasNoPushups ? (
          <p className="text-sm text-amber-600">
            No pushups were logged during this session.
          </p>
        ) : (
          <Button
            onClick={onConfirm}
            className="w-full"
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            Upload {summary.totalPushups} Pushups
          </Button>
        )}
        <Button onClick={onDiscard} variant="ghost" className="w-full" disabled={isSubmitting}>
          {hasNoPushups ? "Close" : "Discard Session"}
        </Button>
      </div>
    </div>
  );
}
