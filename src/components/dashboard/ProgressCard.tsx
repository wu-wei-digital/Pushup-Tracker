"use client";

import { Card, ProgressBar } from "@/components/ui";

interface ProgressCardProps {
  total: number;
  goal: number;
  progress: number;
}

export default function ProgressCard({ total, goal, progress }: ProgressCardProps) {
  return (
    <Card className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 dark:bg-primary-900/30 rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Yearly Progress
        </h3>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {total.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              of {goal.toLocaleString()} goal
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {progress.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              complete
            </p>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar value={progress} size="lg" />
        </div>

        {progress >= 100 && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-center">
            <p className="text-green-600 dark:text-green-400 font-medium">
              Goal achieved! Keep going!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
