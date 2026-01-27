"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui";
import QuickAddButtons from "@/components/log/QuickAddButtons";
import TodayEntries from "@/components/log/TodayEntries";
import { useEntries } from "@/hooks/useEntries";
import { useAuth } from "@/contexts/AuthContext";
import { useDayChange } from "@/hooks/useDayChange";

export default function LogPage() {
    const { user, refreshUser } = useAuth();
    const {
        entries,
        todayTotal,
        isLoading,
        fetchTodayEntries,
        addEntry,
        updateEntry,
        deleteEntry,
    } = useEntries({ onEntryChange: refreshUser });

    // Fetch entries on page load
    useEffect(() => {
        fetchTodayEntries();
    }, [fetchTodayEntries]);

    // Refresh entries when the day changes (midnight in user's timezone)
    useDayChange(fetchTodayEntries, user?.timezone);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
          Log Pushups
                </h1>
                <p className="text-gray-600 mt-1">
          Quick add or enter a custom amount
                </p>
            </div>

            {/* Today's Total */}
            <Card className="text-center">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Today&apos;s Total
                </p>
                <p className="text-5xl font-bold text-primary-600 mt-2">
                    {todayTotal}
                </p>
                <p className="text-gray-600 mt-1">
          pushup{todayTotal !== 1 ? "s" : ""}
                </p>
            </Card>

            {/* Quick Add Buttons */}
            <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Add
                </h2>
                <QuickAddButtons onAdd={addEntry} />
            </Card>

            {/* Today's Entries */}
            <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
