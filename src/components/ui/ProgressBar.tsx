"use client";

import { clsx } from "clsx";

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "danger";
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
    value,
    max = 100,
    size = "md",
    color = "primary",
    showLabel = false,
    className,
}: ProgressBarProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizes = {
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-4",
    };

    const colors = {
        primary: "bg-sage-500",
        success: "bg-sage-600",
        warning: "bg-amber-400",
        danger: "bg-coral-500",
    };

    return (
        <div className={clsx("w-full", className)}>
            <div
                className={clsx(
                    "w-full bg-sage-100 rounded-full overflow-hidden",
                    sizes[size]
                )}
            >
                <div
                    className={clsx(
                        "h-full rounded-full transition-all duration-500 ease-out",
                        colors[color]
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <div className="mt-1 text-sm text-sage-600 text-right">
                    {percentage.toFixed(1)}%
                </div>
            )}
        </div>
    );
}
