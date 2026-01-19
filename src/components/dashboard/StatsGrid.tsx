"use client";

import { Card } from "@/components/ui";

interface StatsGridProps {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  averagePerDay: number;
}

export default function StatsGrid({
  todayTotal,
  weekTotal,
  monthTotal,
  averagePerDay,
}: StatsGridProps) {
  const stats = [
    {
      label: "Today",
      value: todayTotal,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/50",
    },
    {
      label: "This Week",
      value: weekTotal,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50",
    },
    {
      label: "This Month",
      value: monthTotal,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/50",
    },
    {
      label: "Daily Average",
      value: averagePerDay,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} padding="sm">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
