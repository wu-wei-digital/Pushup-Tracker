"use client";

import { Card } from "@/components/ui";

interface DailyTargetCardProps {
  dailyTarget: number;
  todayTotal: number;
}

export default function DailyTargetCard({ dailyTarget, todayTotal }: DailyTargetCardProps) {
  const remaining = Math.max(dailyTarget - todayTotal, 0);
  const achieved = todayTotal >= dailyTarget;

  return (
    <Card
      className={
        achieved
          ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20"
          : "bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20"
      }
    >
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Daily Target
      </h3>

      <div className="mt-4">
        <p className="text-4xl font-bold text-gray-900 dark:text-white">
          {dailyTarget}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          pushups per day to reach goal
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {achieved ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Daily target achieved!</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Remaining today:
            </span>
            <span className="font-bold text-primary-600 dark:text-primary-400">
              {remaining}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
