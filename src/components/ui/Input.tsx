"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-sage-700 mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full px-3 py-2 border rounded-lg transition-all duration-200",
            "bg-white",
            "text-foreground",
            "placeholder-sage-400",
            "focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent",
            error
              ? "border-coral-500 focus:ring-coral-500"
              : "border-sage-200 hover:border-sage-300",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-coral-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-sage-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
