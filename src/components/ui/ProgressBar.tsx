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
    primary: "bg-primary-600 dark:bg-primary-500",
    success: "bg-green-600 dark:bg-green-500",
    warning: "bg-yellow-500 dark:bg-yellow-400",
    danger: "bg-red-600 dark:bg-red-500",
  };

  return (
    <div className={clsx("w-full", className)}>
      <div
        className={clsx(
          "w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden",
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
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 text-right">
          {percentage.toFixed(1)}%
        </div>
      )}
    </div>
  );
}
