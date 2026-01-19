"use client";

import { useState, useCallback } from "react";
import type { PushupEntry } from "@/types";

interface TodayEntriesResponse {
  entries: PushupEntry[];
  total: number;
}

export function useEntries() {
  const [entries, setEntries] = useState<PushupEntry[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/entries/today");
      if (!res.ok) throw new Error("Failed to fetch entries");
      const data: TodayEntriesResponse = await res.json();
      setEntries(data.entries);
      setTodayTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addEntry = useCallback(async (amount: number, note?: string) => {
    setError(null);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, note }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add entry");
      }

      const { entry, pointsEarned } = await res.json();

      // Optimistically update local state
      setEntries((prev) => [entry, ...prev]);
      setTodayTotal((prev) => prev + amount);

      return { success: true, entry, pointsEarned };
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const updateEntry = useCallback(async (id: number, data: { amount?: number; note?: string | null }) => {
    setError(null);
    try {
      const res = await fetch(`/api/entries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const responseData = await res.json();
        throw new Error(responseData.error || "Failed to update entry");
      }

      const { entry } = await res.json();

      // Update local state
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...entry } : e))
      );

      // Recalculate today total if amount changed
      if (data.amount !== undefined) {
        const oldEntry = entries.find((e) => e.id === id);
        if (oldEntry) {
          setTodayTotal((prev) => prev - oldEntry.amount + data.amount!);
        }
      }

      return { success: true, entry };
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      return { success: false, error: message };
    }
  }, [entries]);

  const deleteEntry = useCallback(async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/entries/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete entry");
      }

      // Update local state
      const deletedEntry = entries.find((e) => e.id === id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (deletedEntry) {
        setTodayTotal((prev) => prev - deletedEntry.amount);
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      return { success: false, error: message };
    }
  }, [entries]);

  return {
    entries,
    todayTotal,
    isLoading,
    error,
    fetchTodayEntries,
    addEntry,
    updateEntry,
    deleteEntry,
  };
}
