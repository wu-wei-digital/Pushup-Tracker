import { Suspense } from "react";
import { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
    title: "Reset Password - Pushup Tracker",
    description: "Set a new password for your Pushup Tracker account.",
};

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="animate-pulse bg-sage-200 rounded-xl h-96" />}>
            <ResetPasswordForm />
        </Suspense>
    );
}
