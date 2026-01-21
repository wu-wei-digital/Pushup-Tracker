"use client";

import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
    className,
    variant = "text",
    width,
    height,
}: SkeletonProps) {
    const variants = {
        text: "rounded",
        circular: "rounded-full",
        rectangular: "rounded-lg",
    };

    return (
        <div
            className={clsx(
                "animate-pulse bg-sage-200",
                variants[variant],
                className
            )}
            style={{
                width: width,
                height: height || (variant === "text" ? "1em" : undefined),
            }}
        />
    );
}

// Pre-built skeleton components for common use cases
export function CardSkeleton() {
    return (
        <div className="p-4 sm:p-6 rounded-2xl bg-white border border-sage-100 shadow-sm">
            <Skeleton className="h-4 w-1/3 mb-4" />
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-2.5 w-full" variant="rectangular" />
        </div>
    );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
    return (
        <tr>
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}

export function EntryItemSkeleton() {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-sage-50">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10" variant="circular" />
                <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <Skeleton className="h-8 w-16" variant="rectangular" />
        </div>
    );
}
