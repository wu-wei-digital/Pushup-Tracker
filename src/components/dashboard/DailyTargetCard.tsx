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
                    ? "bg-gradient-to-br from-sage-50 to-sage-100"
                    : "bg-gradient-to-br from-sage-50/50 to-sage-100/50"
            }
        >
            <h3 className="text-sm font-medium text-sage-500 uppercase tracking-wide">
        Daily Target
            </h3>

            <div className="mt-4">
                <p className="text-4xl font-bold text-foreground">
                    {dailyTarget.toFixed(2)}
                </p>
                <p className="text-sm text-sage-500 mt-1">
          pushups per day to reach goal
                </p>
            </div>

            <div className="mt-4 pt-4 border-t border-sage-200">
                {achieved ? (
                    <div className="flex items-center gap-2 text-sage-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">Daily target achieved!</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-sage-500">
              Remaining today:
                        </span>
                        <span className="font-bold text-coral-500">
                            {remaining.toFixed(2)}
                        </span>
                    </div>
                )}
            </div>
        </Card>
    );
}
