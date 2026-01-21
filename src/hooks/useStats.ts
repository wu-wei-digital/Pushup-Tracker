"use client";

import { useState, useCallback } from "react";
import type { UserStats } from "@/types";

interface StatsResponse extends UserStats {
  yearlyGoal: number;
}

export function useStats() {
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/stats");
            if (!res.ok) throw new Error("Failed to fetch stats");
            const data = await res.json();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        stats,
        isLoading,
        error,
        fetchStats,
    };
}
