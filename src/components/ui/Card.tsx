"use client";

import { HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = "default", padding = "md", hover = false, children, ...props }, ref) => {
        const variants = {
            default: "bg-white border border-sage-100 shadow-sm",
            elevated: "bg-white shadow-lg shadow-sage-500/10",
            outlined: "bg-white border-2 border-sage-200",
            glass: "bg-white/80 backdrop-blur-md border border-white/20",
        };

        const paddings = {
            none: "",
            sm: "p-3",
            md: "p-4 sm:p-6",
            lg: "p-6 sm:p-8",
        };

        return (
            <div
                ref={ref}
                className={clsx(
                    "rounded-2xl transition-all duration-300",
                    variants[variant],
                    paddings[padding],
                    hover && "hover:-translate-y-1 hover:shadow-lg hover:shadow-sage-500/10",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";

export default Card;
