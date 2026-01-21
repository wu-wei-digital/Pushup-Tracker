"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Hook that detects when the local day changes and calls a callback.
 * This is useful for refreshing daily stats when midnight passes.
 *
 * It checks for day changes:
 * - When the page becomes visible again (e.g., user returns to the tab)
 * - Every minute while the page is active
 *
 * @param onDayChange - Callback function to run when a new day is detected
 * @param timezone - Optional timezone to use for day calculation (defaults to browser timezone)
 */
export function useDayChange(onDayChange: () => void, timezone?: string) {
    const lastDateRef = useRef<string>("");

    const getCurrentDateString = useCallback(() => {
        const now = new Date();
        const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

        try {
            return new Intl.DateTimeFormat("en-CA", {
                timeZone: tz,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }).format(now);
        } catch {
            // Fallback if timezone is invalid
            return now.toISOString().split("T")[0];
        }
    }, [timezone]);

    const checkDayChange = useCallback(() => {
        const currentDate = getCurrentDateString();

        if (lastDateRef.current && lastDateRef.current !== currentDate) {
            // Day has changed
            onDayChange();
        }

        lastDateRef.current = currentDate;
    }, [getCurrentDateString, onDayChange]);

    useEffect(() => {
    // Initialize the date reference
        lastDateRef.current = getCurrentDateString();

        // Check when the page becomes visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                checkDayChange();
            }
        };

        // Check periodically (every minute)
        const intervalId = setInterval(checkDayChange, 60000);

        // Also check when the window gains focus
        const handleFocus = () => {
            checkDayChange();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleFocus);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleFocus);
        };
    }, [checkDayChange, getCurrentDateString]);
}
