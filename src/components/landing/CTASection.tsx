"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui";

export default function CTASection() {
    const { user, isLoading } = useAuth();

    return (
        <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
          Ready to Start Your Journey?
                </h2>

                <p className="text-lg text-sage-600 max-w-xl mx-auto mb-10">
          Join others tracking their pushup progress today. It&apos;s free to get started.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    {isLoading ? (
                        <>
                            <div className="h-12 w-40 bg-sage-200 rounded-lg animate-pulse" />
                            <div className="h-12 w-40 bg-sage-100 rounded-lg animate-pulse" />
                        </>
                    ) : user ? (
                        <>
                            <Link href="/dashboard">
                                <Button size="lg">Go to Dashboard</Button>
                            </Link>
                            <Link href="/leaderboard">
                                <Button size="lg" variant="outline">View Leaderboard</Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/register">
                                <Button size="lg">Get Started Free</Button>
                            </Link>
                            <Link href="/login">
                                <Button size="lg" variant="outline">Login</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
