"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Input, Card } from "@/components/ui";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/dashboard";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            router.push(redirect);
        } else {
            setError(result.error || "Login failed");
            setIsLoading(false);
        }
    };

    return (
        <Card variant="outlined" padding="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-display font-semibold text-foreground text-center">
          Welcome back
                </h2>

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

                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                />

                <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign In
                </Button>

                <p className="text-center text-sm text-sage-600">
          Don&apos;t have an account?{" "}
                    <Link
                        href="/register"
                        className="text-sage-700 hover:text-coral-500 font-medium transition-colors"
                    >
            Sign up
                    </Link>
                </p>
            </form>
        </Card>
    );
}
