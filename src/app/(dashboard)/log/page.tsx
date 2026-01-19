"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui";
import QuickAddButtons from "@/components/log/QuickAddButtons";
import TodayEntries from "@/components/log/TodayEntries";
import { useEntries } from "@/hooks/useEntries";

export default function LogPage() {
  const {
    entries,
    todayTotal,
    isLoading,
    fetchTodayEntries,
    addEntry,
    updateEntry,
    deleteEntry,
  } = useEntries();

  useEffect(() => {
    fetchTodayEntries();
  }, [fetchTodayEntries]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Log Pushups
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Quick add or enter a custom amount
        </p>
      </div>

      {/* Today's Total */}
      <Card className="text-center">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Today&apos;s Total
        </p>
        <p className="text-5xl font-bold text-primary-600 dark:text-primary-400 mt-2">
          {todayTotal}
        </p>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          pushup{todayTotal !== 1 ? "s" : ""}
        </p>
      </Card>

      {/* Quick Add Buttons */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Add
        </h2>
        <QuickAddButtons onAdd={addEntry} />
      </Card>

      {/* Today's Entries */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Today&apos;s Entries
        </h2>
        <TodayEntries
          entries={entries}
          isLoading={isLoading}
          onUpdate={updateEntry}
          onDelete={deleteEntry}
        />
      </Card>
    </div>
  );
}
