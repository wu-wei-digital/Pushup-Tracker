"use client";

import { useMemo } from "react";
import { format, startOfYear, eachDayOfInterval, getDay, differenceInWeeks, startOfWeek } from "date-fns";
import { clsx } from "clsx";

interface CalendarHeatmapProps {
  data: Array<{ date: string; amount: number }>;
}

export default function CalendarHeatmap({ data }: CalendarHeatmapProps) {
    const { weeks, maxValue } = useMemo(() => {
        const yearStart = startOfYear(new Date());
        const today = new Date();
        const days = eachDayOfInterval({ start: yearStart, end: today });

        // Create a map of date -> total
        const map = new Map<string, number>();
        let max = 0;

        for (const item of data) {
            const dateKey = item.date.split("T")[0];
            const current = map.get(dateKey) || 0;
            const newTotal = current + item.amount;
            map.set(dateKey, newTotal);
            if (newTotal > max) max = newTotal;
        }

        // Group days into weeks (Monday start)
        const weekStart = startOfWeek(yearStart, { weekStartsOn: 1 });
        const numWeeks = differenceInWeeks(today, weekStart) + 1;

        const weeksArray: Array<Array<{ date: Date; dateStr: string; total: number } | null>> = [];

        for (let w = 0; w < numWeeks; w++) {
            weeksArray.push(Array(7).fill(null));
        }

        for (const day of days) {
            const weekIndex = differenceInWeeks(day, weekStart);
            // Convert: Sunday (0) → 6, Monday (1) → 0, ... Saturday (6) → 5
            const rawDay = getDay(day);
            const dayIndex = rawDay === 0 ? 6 : rawDay - 1;
            const dateStr = format(day, "yyyy-MM-dd");
            weeksArray[weekIndex][dayIndex] = {
                date: day,
                dateStr,
                total: map.get(dateStr) || 0,
            };
        }

        return { weeks: weeksArray, maxValue: max || 1, dataMap: map };
    }, [data]);

    const getColorClass = (total: number) => {
        if (total === 0) return "bg-gray-100";
        const intensity = total / maxValue;
        if (intensity < 0.25) return "bg-green-200";
        if (intensity < 0.5) return "bg-green-400";
        if (intensity < 0.75) return "bg-green-500";
        return "bg-green-600";
    };

    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
        <div className="overflow-x-auto">
            <div className="inline-flex gap-1">
                {/* Day labels */}
                <div className="flex flex-col gap-1 pr-2">
                    {dayLabels.map((label, i) => (
                        <div
                            key={label}
                            className={clsx(
                                "h-3 text-xs text-gray-400 leading-3",
                                i % 2 === 1 ? "invisible" : ""
                            )}
                        >
                            {i % 2 === 0 ? label.charAt(0) : ""}
                        </div>
                    ))}
                </div>

                {/* Weeks */}
                <div className="flex gap-1">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {week.map((day, dayIndex) => (
                                <div
                                    key={dayIndex}
                                    className={clsx(
                                        "w-3 h-3 rounded-sm",
                                        day ? getColorClass(day.total) : "bg-transparent"
                                    )}
                                    title={
                                        day
                                            ? `${format(day.date, "MMM d, yyyy")}: ${day.total} pushups`
                                            : undefined
                                    }
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-3 text-xs text-gray-500">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-gray-100" />
                    <div className="w-3 h-3 rounded-sm bg-green-200" />
                    <div className="w-3 h-3 rounded-sm bg-green-400" />
                    <div className="w-3 h-3 rounded-sm bg-green-500" />
                    <div className="w-3 h-3 rounded-sm bg-green-600" />
                </div>
                <span>More</span>
            </div>
        </div>
    );
}
