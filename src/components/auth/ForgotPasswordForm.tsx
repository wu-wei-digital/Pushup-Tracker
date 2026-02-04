"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Card } from "@/components/ui";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Something went wrong");
                return;
            }

            setIsSubmitted(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <Card variant="outlined" padding="lg">
                <div className="text-center space-y-4">
                    <h2 className="text-xl font-display font-semibold text-foreground">
                        Check your email
                    </h2>
                    <p className="text-sage-600 text-sm">
                        If an account exists with that email, we&apos;ve sent a password reset link.
                        Please check your inbox and spam folder.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block text-sm text-sage-700 hover:text-coral-500 font-medium transition-colors"
                    >
                        Back to login
                    </Link>
                </div>
            </Card>
        );
    }

    return (
        <Card variant="outlined" padding="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-display font-semibold text-foreground text-center">
                    Forgot your password?
                </h2>
                <p className="text-sage-600 text-sm text-center">
                    Enter your email and we&apos;ll send you a link to reset your password.
                </p>

                {error && (
                    <div className="p-3 rounded-lg bg-coral-50 text-coral-600 text-sm">
                        {error}
                    </div>
                )}

                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                    Send Reset Link
                </Button>

                <p className="text-center text-sm text-sage-600">
                    <Link
                        href="/login"
                        className="text-sage-700 hover:text-coral-500 font-medium transition-colors"
                    >
                        Back to login
                    </Link>
                </p>
            </form>
        </Card>
    );
}
