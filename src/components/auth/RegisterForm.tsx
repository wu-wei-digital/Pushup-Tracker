"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Input, Card } from "@/components/ui";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }
    if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email";
    }
    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    // Auto-detect browser timezone
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const result = await register(username, email, password, detectedTimezone);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setErrors({ form: result.error || "Registration failed" });
      setIsLoading(false);
    }
  };

  return (
    <Card variant="outlined" padding="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 text-center">
          Create your account
        </h2>

        {errors.form && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {errors.form}
          </div>
        )}

        <Input
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="johndoe"
          error={errors.username}
          required
          autoComplete="username"
        />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={errors.email}
          required
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a strong password"
          error={errors.password}
          helperText="At least 8 characters with uppercase, lowercase, and number"
          required
          autoComplete="new-password"
        />

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create Account
        </Button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary-600 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </form>
    </Card>
  );
}
