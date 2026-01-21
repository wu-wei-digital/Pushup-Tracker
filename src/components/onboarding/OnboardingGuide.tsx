"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "@/components/ui";
import { OnboardingStep } from "./OnboardingStep";
import type { OnboardingProgress } from "@/app/api/users/onboarding/route";

export function OnboardingGuide() {
    const [progress, setProgress] = useState<OnboardingProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDismissing, setIsDismissing] = useState(false);

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        try {
            const res = await fetch("/api/users/onboarding");
            if (res.ok) {
                const data = await res.json();
                setProgress(data);
            }
        } catch (error) {
            console.error("Failed to fetch onboarding progress:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDismiss = async () => {
        setIsDismissing(true);
        try {
            const res = await fetch("/api/users/onboarding", { method: "PATCH" });
            if (res.ok) {
                setProgress(prev => prev ? { ...prev, showGuide: false } : null);
            }
        } catch (error) {
            console.error("Failed to dismiss onboarding:", error);
        } finally {
            setIsDismissing(false);
        }
    };

    if (isLoading) {
        return null;
    }

    if (!progress || !progress.showGuide) {
        return null;
    }

    const completedCount = [
        progress.hasLoggedPushup,
        progress.hasAddedFriend,
        progress.hasJoinedChallenge,
        progress.hasJoinedTeam,
    ].filter(Boolean).length;

    const totalSteps = 4;
    const progressPercent = (completedCount / totalSteps) * 100;

    return (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Getting Started
                    </h2>
                    <p className="text-sm text-sage-600 mt-1">
                        Complete these steps to get the most out of your pushup journey!
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    disabled={isDismissing}
                    className="text-sage-500 hover:text-sage-700"
                >
                    {isDismissing ? "..." : "Dismiss"}
                </Button>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-sage-600 mb-1">
                    <span>Progress</span>
                    <span>{completedCount} of {totalSteps} completed</span>
                </div>
                <div className="h-2 bg-sage-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
                <OnboardingStep
                    title="Log your first pushup"
                    description="Start tracking your fitness journey"
                    isComplete={progress.hasLoggedPushup}
                    link="/log"
                    linkText="Log now"
                />
                <OnboardingStep
                    title="Add your first friend"
                    description="Connect with others for motivation"
                    isComplete={progress.hasAddedFriend}
                    link="/friends"
                    linkText="Find friends"
                />
                <OnboardingStep
                    title="Join a challenge"
                    description="Compete and stay motivated"
                    isComplete={progress.hasJoinedChallenge}
                    link="/challenges"
                    linkText="Browse challenges"
                />
                <OnboardingStep
                    title="Join a team"
                    description="Work together towards shared goals"
                    isComplete={progress.hasJoinedTeam}
                    link="/teams"
                    linkText="Find teams"
                />
            </div>

            {progress.isComplete && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-sm font-medium text-green-700">
                        Congratulations! You&apos;ve completed all the getting started steps!
                    </p>
                </div>
            )}
        </Card>
    );
}
