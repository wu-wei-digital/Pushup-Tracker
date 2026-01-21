"use client";

import { useState } from "react";

interface AvatarProps {
    src?: string | null;
    name: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-16 h-16 text-2xl",
    xl: "w-24 h-24 text-4xl",
};

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
    const [hasError, setHasError] = useState(false);

    const initial = name.charAt(0).toUpperCase();

    if (src && !hasError) {
        return (
            <div className={`relative rounded-full overflow-hidden bg-primary/10 ${sizeClasses[size]} ${className}`}>
                <img
                    src={src}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={() => setHasError(true)}
                />
            </div>
        );
    }

    return (
        <div
            className={`rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold ${sizeClasses[size]} ${className}`}
        >
            {initial}
        </div>
    );
}
