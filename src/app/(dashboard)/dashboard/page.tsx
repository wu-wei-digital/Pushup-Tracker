"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ProgressCard, DailyTargetCard, StatsGrid, StreakCard } from "@/components/dashboard";
import { useStats } from "@/hooks/useStats";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, isLoading, fetchStats } = useStats();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-sage-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-sage-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Welcome back, {user?.displayName || user?.username}!
          </h1>
          <p className="text-sage-600 mt-1">
            {user?.currentTitle && (
              <span className="inline-flex items-center gap-1">
                <span className="text-sage-700 font-medium">
                  {user.currentTitle}
                </span>
                <span className="mx-1">·</span>
              </span>
            )}
            Level {user?.level} · {user?.points.toLocaleString()} XP
          </p>
        </div>
        <Link href="/log">
          <Button size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Log Pushups
          </Button>
        </Link>
      </div>

      {/* Progress and Daily Target */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressCard
          total={stats.yearTotal}
          goal={stats.yearlyGoal}
          progress={stats.yearProgress}
        />
        <DailyTargetCard
          dailyTarget={stats.dailyTarget}
          todayTotal={stats.todayTotal}
        />
      </div>

      {/* Stats Grid */}
      <StatsGrid
        todayTotal={stats.todayTotal}
        weekTotal={stats.weekTotal}
        monthTotal={stats.monthTotal}
        averagePerDay={stats.averagePerDay}
      />

      {/* Streak */}
      <StreakCard
        currentStreak={stats.currentStreak}
        longestStreak={stats.longestStreak}
      />

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/leaderboard">
            <div className="p-4 rounded-xl bg-sage-50 hover:bg-sage-100 transition-colors text-center">
              <div className="text-2xl mb-2">🏆</div>
              <p className="text-sm font-medium text-sage-700">Leaderboard</p>
            </div>
          </Link>
          <Link href="/achievements">
            <div className="p-4 rounded-xl bg-sage-50 hover:bg-sage-100 transition-colors text-center">
              <div className="text-2xl mb-2">🏅</div>
              <p className="text-sm font-medium text-sage-700">Achievements</p>
            </div>
          </Link>
          <Link href="/challenges">
            <div className="p-4 rounded-xl bg-sage-50 hover:bg-sage-100 transition-colors text-center">
              <div className="text-2xl mb-2">🎯</div>
              <p className="text-sm font-medium text-sage-700">Challenges</p>
            </div>
          </Link>
          <Link href="/friends">
            <div className="p-4 rounded-xl bg-sage-50 hover:bg-sage-100 transition-colors text-center">
              <div className="text-2xl mb-2">👥</div>
              <p className="text-sm font-medium text-sage-700">Friends</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
