import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login - Pushup Tracker",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-sage-200 rounded-xl h-96" />}>
      <LoginForm />
    </Suspense>
  );
}
