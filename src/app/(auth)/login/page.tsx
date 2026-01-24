import { Suspense } from "react";
import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
    title: "Login - Pushup Tracker",
    description: "Sign in to your Pushup Tracker account. Track your pushups, compete with friends, and achieve your fitness goals.",
    robots: {
        index: true,
        follow: true,
    },
};

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="animate-pulse bg-sage-200 rounded-xl h-96" />}>
            <LoginForm />
        </Suspense>
    );
}
