"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthLayout({
    children,
}: {
  children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            router.push("/dashboard");
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-500" />
            </div>
        );
    }

    if (user) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Centered content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-block mb-4">
                            <Image
                                src="/pushup-tracker-logo-light.png"
                                alt="Pushup Tracker"
                                width={64}
                                height={64}
                            />
                        </div>
                        <h1 className="text-2xl font-display font-bold text-foreground">
              Pushup Tracker
                        </h1>
                        <p className="text-sage-600 mt-2">
              Track your progress, compete with friends
                        </p>
                    </div>

                    {children}
                </div>
            </div>

            {/* Footer branding */}
            <div className="text-center py-4">
                <p className="text-sm text-sage-400">
          A{" "}
                    <a
                        href="https://wuwei.digital"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sage-500 hover:text-coral-500 transition-colors"
                    >
            Wu Wei Digital
                    </a>
                    {" "}project
                </p>
            </div>
        </div>
    );
}
