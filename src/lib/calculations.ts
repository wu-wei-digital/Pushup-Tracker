import { startOfYear, endOfYear, differenceInDays, startOfDay } from "date-fns";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateDailyTarget(yearlyGoal: number, totalDone: number, timezone: string = "UTC"): number {
    const now = new Date();
    const yearEnd = endOfYear(now);
    const daysRemaining = differenceInDays(yearEnd, now) + 1;

    const remaining = yearlyGoal - totalDone;
    if (remaining <= 0) return 0;

    return Math.ceil(remaining / daysRemaining);
}

export function calculateYearProgress(totalDone: number, yearlyGoal: number): number {
    if (yearlyGoal <= 0) return 0;
    return Math.min((totalDone / yearlyGoal) * 100, 100);
}

export function getDaysElapsedInYear(): number {
    const now = new Date();
    const yearStart = startOfYear(now);
    return differenceInDays(now, yearStart) + 1;
}

export function calculateStreak(entryDates: Date[]): { current: number; longest: number } {
    if (entryDates.length === 0) return { current: 0, longest: 0 };

    // Sort dates in descending order (most recent first)
    const sortedDates = [...entryDates]
        .map(d => startOfDay(new Date(d)))
        .sort((a, b) => b.getTime() - a.getTime());

    // Remove duplicates (same day)
    const uniqueDates: Date[] = [];
    for (const date of sortedDates) {
        if (uniqueDates.length === 0 || uniqueDates[uniqueDates.length - 1].getTime() !== date.getTime()) {
            uniqueDates.push(date);
        }
    }

    const today = startOfDay(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Calculate current streak
    let currentStreak = 0;
    const firstDate = uniqueDates[0];

    // Check if the most recent entry is today or yesterday
    if (firstDate.getTime() === today.getTime() || firstDate.getTime() === yesterday.getTime()) {
        currentStreak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
            const expectedDate = new Date(uniqueDates[i - 1]);
            expectedDate.setDate(expectedDate.getDate() - 1);

            if (uniqueDates[i].getTime() === expectedDate.getTime()) {
                currentStreak++;
            } else {
                break;
            }
        }
    }

    // Calculate longest streak
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
        const expectedDate = new Date(uniqueDates[i - 1]);
        expectedDate.setDate(expectedDate.getDate() - 1);

        if (uniqueDates[i].getTime() === expectedDate.getTime()) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 1;
        }
    }

    return {
        current: currentStreak,
        longest: Math.max(longestStreak, currentStreak)
    };
}

export function getTodayBounds(timezone?: string): { start: Date; end: Date } {
    const now = new Date();

    if (timezone) {
    // Get today's date in the user's timezone
        const formatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
        const dateStr = formatter.format(now); // YYYY-MM-DD format

        // Create start and end of day in user's timezone, then convert to UTC
        const startLocal = new Date(`${dateStr}T00:00:00`);
        const endLocal = new Date(`${dateStr}T23:59:59.999`);

        // Get timezone offset for that day
        const tzFormatter = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            timeZoneName: "shortOffset"
        });
        const parts = tzFormatter.formatToParts(startLocal);
        const offsetPart = parts.find(p => p.type === "timeZoneName")?.value || "+00:00";

        // Parse offset and convert to UTC
        const match = offsetPart.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
        let offsetMinutes = 0;
        if (match) {
            const sign = match[1] === "+" ? 1 : -1;
            const hours = parseInt(match[2], 10);
            const mins = parseInt(match[3] || "0", 10);
            offsetMinutes = sign * (hours * 60 + mins);
        }

        const start = new Date(startLocal.getTime() - offsetMinutes * 60 * 1000);
        const end = new Date(endLocal.getTime() - offsetMinutes * 60 * 1000);

        return { start, end };
    }

    // Fallback to UTC
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    return { start, end };
}

export function getWeekBounds(timezone?: string): { start: Date; end: Date } {
    const now = new Date();

    if (timezone) {
        const formatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
        const dateStr = formatter.format(now);
        const localDate = new Date(dateStr + "T12:00:00");
        const dayOfWeek = localDate.getDay();

        const startDate = new Date(localDate);
        startDate.setDate(localDate.getDate() - dayOfWeek);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        const startStr = formatter.format(startDate);
        const endStr = formatter.format(endDate);

        // Get timezone offset
        const tzFormatter = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            timeZoneName: "shortOffset"
        });
        const parts = tzFormatter.formatToParts(now);
        const offsetPart = parts.find(p => p.type === "timeZoneName")?.value || "+00:00";
        const match = offsetPart.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
        let offsetMinutes = 0;
        if (match) {
            const sign = match[1] === "+" ? 1 : -1;
            const hours = parseInt(match[2], 10);
            const mins = parseInt(match[3] || "0", 10);
            offsetMinutes = sign * (hours * 60 + mins);
        }

        const startLocal = new Date(`${startStr}T00:00:00`);
        const endLocal = new Date(`${endStr}T23:59:59.999`);

        return {
            start: new Date(startLocal.getTime() - offsetMinutes * 60 * 1000),
            end: new Date(endLocal.getTime() - offsetMinutes * 60 * 1000)
        };
    }

    // Fallback to UTC
    const dayOfWeek = now.getUTCDay();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayOfWeek, 0, 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayOfWeek + 6, 23, 59, 59, 999));

    return { start, end };
}

export function getMonthBounds(timezone?: string): { start: Date; end: Date } {
    const now = new Date();

    if (timezone) {
        const formatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
        const dateStr = formatter.format(now);
        const [year, month] = dateStr.split("-").map(Number);

        // Get timezone offset
        const tzFormatter = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            timeZoneName: "shortOffset"
        });
        const parts = tzFormatter.formatToParts(now);
        const offsetPart = parts.find(p => p.type === "timeZoneName")?.value || "+00:00";
        const match = offsetPart.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
        let offsetMinutes = 0;
        if (match) {
            const sign = match[1] === "+" ? 1 : -1;
            const hours = parseInt(match[2], 10);
            const mins = parseInt(match[3] || "0", 10);
            offsetMinutes = sign * (hours * 60 + mins);
        }

        const lastDay = new Date(year, month, 0).getDate();
        const startLocal = new Date(`${year}-${String(month).padStart(2, "0")}-01T00:00:00`);
        const endLocal = new Date(`${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59.999`);

        return {
            start: new Date(startLocal.getTime() - offsetMinutes * 60 * 1000),
            end: new Date(endLocal.getTime() - offsetMinutes * 60 * 1000)
        };
    }

    // Fallback to UTC
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    return { start, end };
}
