"use client";

import { Card } from "@/components/ui";

const features = [
    {
        icon: (
            <svg className="w-8 h-8 text-sage-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        title: "Track Your Progress",
        description: "Log your daily pushups, set personal goals, and visualize your progress with beautiful charts and statistics.",
    },
    {
        icon: (
            <svg className="w-8 h-8 text-coral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        ),
        title: "Gamification & Achievements",
        description: "Earn XP, level up, unlock badges, and climb the leaderboards as you build your pushup habit.",
    },
    {
        icon: (
            <svg className="w-8 h-8 text-sage-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        title: "Social & Community",
        description: "Connect with friends, join teams, participate in challenges, and celebrate achievements together.",
    },
];

export default function FeaturesSection() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Everything You Need to Succeed
                    </h2>
                    <p className="text-sage-600 max-w-2xl mx-auto">
            Our app provides all the tools you need to build and maintain a consistent pushup routine.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            variant="elevated"
                            padding="lg"
                            hover
                            className="text-center"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sage-50 mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-display font-bold text-foreground mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-sage-600">
                                {feature.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
