"use client";

import { useState } from "react";
import { Card, Button, Input } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
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
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Goal */}
      <Card>
        <h2 className="text-lg font-semibold text-foreground mb-4">
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
        <p className="text-sm text-sage-500 mt-2">
          This is your target number of pushups for the year
        </p>
      </Card>

      {/* Account */}
      <Card>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Account
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-sage-600">Username</p>
            <p className="font-medium text-foreground">
              {user?.username}
            </p>
          </div>
          <div>
            <p className="text-sm text-sage-600">Email</p>
            <p className="font-medium text-foreground">
              {user?.email}
            </p>
          </div>
          <div className="pt-4 border-t border-sage-200">
            <Button variant="danger" onClick={logout}>
              Log Out
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
