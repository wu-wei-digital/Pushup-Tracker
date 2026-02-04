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

    // Change password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handleChangePassword = async () => {
        setPasswordError("");

        if (newPassword !== confirmNewPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        setIsChangingPassword(true);
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                setPasswordError(data.error || "Failed to change password");
                return;
            }

            showToast("success", "Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch {
            setPasswordError("Something went wrong. Please try again.");
        } finally {
            setIsChangingPassword(false);
        }
    };

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

            {/* Change Password */}
            <Card>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                    Change Password
                </h2>
                <div className="space-y-3">
                    {passwordError && (
                        <div className="p-3 rounded-lg bg-coral-50 text-coral-600 text-sm">
                            {passwordError}
                        </div>
                    )}
                    <Input
                        label="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                    />
                    <Input
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                    />
                    <Input
                        label="Confirm New Password"
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                    />
                    <p className="text-xs text-sage-500">
                        Password must be at least 8 characters with uppercase, lowercase, and a number.
                    </p>
                    <Button
                        onClick={handleChangePassword}
                        isLoading={isChangingPassword}
                        disabled={!currentPassword || !newPassword || !confirmNewPassword}
                    >
                        Change Password
                    </Button>
                </div>
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
