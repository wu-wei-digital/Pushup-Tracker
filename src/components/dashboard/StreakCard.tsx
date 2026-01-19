"use client";

import { Card } from "@/components/ui";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakCard({ currentStreak, longestStreak }: StreakCardProps) {
  const isNewRecord = currentStreak > 0 && currentStreak >= longestStreak;

  return (
    <Card className="relative overflow-hidden">
      {/* Fire animation for active streak */}
      {currentStreak > 0 && (
        <div className="absolute -top-4 -right-4 text-6xl opacity-20 animate-flicker">
          🔥
        </div>
      )}

      <div className="relative">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Streak
        </h3>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">
              {currentStreak > 0 ? "🔥" : "❄️"}
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentStreak}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                day{currentStreak !== 1 ? "s" : ""} current
              </p>
            </div>
          </div>

          <div className="h-12 w-px bg-gray-200 dark:bg-gray-700" />

          <div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {longestStreak}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              best
            </p>
          </div>
        </div>

        {isNewRecord && currentStreak > 1 && (
          <div className="mt-4 p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-center">
            <p className="text-amber-600 dark:text-amber-400 font-medium text-sm">
              New personal best!
            </p>
          </div>
        )}

        {currentStreak === 0 && (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Log pushups today to start a new streak!
          </p>
        )}
      </div>
    </Card>
  );
}
