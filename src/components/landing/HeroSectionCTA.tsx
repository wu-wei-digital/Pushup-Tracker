"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui";

export default function HeroSectionCTA() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <>
                <div className="h-12 w-40 bg-sage-200 rounded-lg animate-pulse" />
                <div className="h-12 w-40 bg-sage-100 rounded-lg animate-pulse" />
            </>
        );
    }

    if (user) {
        return (
            <>
                <Link href="/dashboard">
                    <Button size="lg">Go to Dashboard</Button>
                </Link>
                <Link href="/leaderboard">
                    <Button size="lg" variant="outline">View Leaderboard</Button>
                </Link>
            </>
        );
    }

    return (
        <>
            <Link href="/register">
                <Button size="lg">Get Started Free</Button>
            </Link>
            <Link href="/login">
                <Button size="lg" variant="outline">Login</Button>
            </Link>
        </>
    );
}
