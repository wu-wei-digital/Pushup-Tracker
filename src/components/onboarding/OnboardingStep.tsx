"use client";

import Link from "next/link";

interface OnboardingStepProps {
    title: string;
    description: string;
    isComplete: boolean;
    link: string;
    linkText: string;
}

export function OnboardingStep({ title, description, isComplete, link, linkText }: OnboardingStepProps) {
    return (
        <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
            isComplete ? "bg-green-50" : "bg-sage-50 hover:bg-sage-100"
        }`}>
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                isComplete
                    ? "bg-green-500 text-white"
                    : "bg-sage-200 text-sage-600"
            }`}>
                {isComplete ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <span className="text-xs font-medium">!</span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-sm font-medium ${
                        isComplete ? "text-green-700" : "text-sage-800"
                    }`}>
                        {title}
                    </h4>
                    {!isComplete && (
                        <Link
                            href={link}
                            className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                        >
                            {linkText}
                        </Link>
                    )}
                </div>
                <p className={`text-xs mt-0.5 ${
                    isComplete ? "text-green-600" : "text-sage-600"
                }`}>
                    {description}
                </p>
            </div>
        </div>
    );
}
