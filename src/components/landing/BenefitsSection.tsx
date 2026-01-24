const benefits = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
        title: "Physical Health",
        description: "Build upper body strength, improve cardiovascular health, and boost your metabolism with regular pushup practice.",
        color: "sage",
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: "Mental Wellbeing",
        description: "Release endorphins, reduce stress, improve sleep quality, and boost your confidence through consistent exercise.",
        color: "coral",
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
        ),
        title: "Discipline & Habits",
        description: "Build consistent habits that extend beyond fitness. The discipline you develop will positively impact all areas of your life.",
        color: "sage",
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
        title: "Community Support",
        description: "Join a supportive community that celebrates your achievements, keeps you accountable, and motivates you to push further.",
        color: "coral",
    },
];

export default function BenefitsSection() {
    return (
        <section className="py-20 bg-gradient-to-b from-background to-sage-50/50" aria-labelledby="benefits-heading">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="text-center mb-16">
                    <h2 id="benefits-heading" className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Why Pushups?
                    </h2>
                    <p className="text-sage-600 max-w-2xl mx-auto">
            The humble pushup is one of the most effective exercises for building strength and discipline.
                    </p>
                </header>

                <div className="grid sm:grid-cols-2 gap-8">
                    {benefits.map((benefit, index) => (
                        <article
                            key={index}
                            className="flex gap-4 p-6 bg-white rounded-2xl border border-sage-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                                benefit.color === "coral"
                                    ? "bg-coral-50 text-coral-500"
                                    : "bg-sage-50 text-sage-500"
                            }`}>
                                {benefit.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-display font-bold text-foreground mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-sage-600 text-sm leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
