"use client";

import { HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    const variants = {
      default: "bg-white dark:bg-gray-800 shadow-sm",
      elevated: "bg-white dark:bg-gray-800 shadow-lg",
      outlined: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
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
          "rounded-xl",
          variants[variant],
          paddings[padding],
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
