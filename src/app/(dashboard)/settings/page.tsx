"use client";

import { useState } from "react";
import { Card, Button, Input } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const [yearlyGoal, setYearlyGoal] = useState(user?.yearlyGoal?.toString() || "10000");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateGoal = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yearlyGoal: parseInt(yearlyGoal) }),
      });
      if (res.ok) {
        showToast("success", "Goal updated!");
        refreshUser();
      }
    } catch {
      showToast("error", "Failed to update");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {/* Theme */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Appearance
        </h2>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose your preferred theme
          </p>
          <div className="flex gap-3">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  theme === t
                    ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-2">
                  {t === "light" ? "☀️" : t === "dark" ? "🌙" : "💻"}
                </div>
                <div className="text-sm font-medium capitalize">{t}</div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Goal */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Yearly Goal
        </h2>
        <div className="flex gap-3">
          <Input
            type="number"
            value={yearlyGoal}
            onChange={(e) => setYearlyGoal(e.target.value)}
            min="100"
            max="1000000"
            className="flex-1"
          />
          <Button onClick={handleUpdateGoal} isLoading={isUpdating}>
            Save
          </Button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          This is your target number of pushups for the year
        </p>
      </Card>

      {/* Account */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Username</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.username}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.email}
            </p>
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="danger" onClick={logout}>
              Log Out
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
