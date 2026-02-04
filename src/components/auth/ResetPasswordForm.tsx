"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Input, Card } from "@/components/ui";

export default function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!token) {
        return (
            <Card variant="outlined" padding="lg">
                <div className="text-center space-y-4">
                    <h2 className="text-xl font-display font-semibold text-foreground">
                        Invalid Reset Link
                    </h2>
                    <p className="text-sage-600 text-sm">
                        This password reset link is invalid. Please request a new one.
                    </p>
                    <Link
                        href="/forgot-password"
                        className="inline-block text-sm text-sage-700 hover:text-coral-500 font-medium transition-colors"
                    >
                        Request new link
                    </Link>
                </div>
            </Card>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong");
                return;
            }

            setIsSuccess(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <Card variant="outlined" padding="lg">
                <div className="text-center space-y-4">
                    <h2 className="text-xl font-display font-semibold text-foreground">
                        Password Reset
                    </h2>
                    <p className="text-sage-600 text-sm">
                        Your password has been reset successfully. You can now log in with your new password.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block text-sm text-sage-700 hover:text-coral-500 font-medium transition-colors"
                    >
                        Go to login
                    </Link>
                </div>
            </Card>
        );
    }

    return (
        <Card variant="outlined" padding="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-display font-semibold text-foreground text-center">
                    Set new password
                </h2>

                {error && (
                    <div className="p-3 rounded-lg bg-coral-50 text-coral-600 text-sm">
                        {error}
                    </div>
                )}

                <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    autoComplete="new-password"
                />

                <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    autoComplete="new-password"
                />

                <p className="text-xs text-sage-500">
                    Password must be at least 8 characters with uppercase, lowercase, and a number.
                </p>

                <Button type="submit" className="w-full" isLoading={isLoading}>
                    Reset Password
                </Button>
            </form>
        </Card>
    );
}
