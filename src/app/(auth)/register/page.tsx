import { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
    title: "Register - Pushup Tracker",
    description: "Create your free Pushup Tracker account. Join a community of fitness enthusiasts, track your progress, and compete with friends.",
    robots: {
        index: true,
        follow: true,
    },
};

export default function RegisterPage() {
    return <RegisterForm />;
}
