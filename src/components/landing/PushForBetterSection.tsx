export default function PushForBetterSection() {
    return (
        <section className="py-20 bg-gradient-to-r from-coral-500 to-coral-600 relative overflow-hidden" aria-labelledby="inspiration-heading">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" aria-hidden="true" />

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Our Inspiration
                </div>

                <h2 id="inspiration-heading" className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">
                    Inspired by The Push Up Challenge
                </h2>

                <p className="text-xl text-white/90 max-w-2xl mx-auto mb-6 leading-relaxed">
                    <a
                        href="https://www.thepushupchallenge.com.au/about-us/push-for-better-foundation"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline underline-offset-2 hover:text-white transition-colors"
                    >
                        The Push Up Challenge
                    </a>{" "}
                    is an annual month-long event run by the Push for Better Foundation in Australia,
                    bringing communities together through fitness while raising awareness and funds for mental health.
                </p>

                <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
                    While this app is not affiliated with their challenge, it was inspired by their mission.
                    We&apos;ve built a year-round platform for anyone looking to build a consistent pushup habit
                    and track their progress over time.
                </p>

                <ul className="flex flex-wrap justify-center gap-6 text-white/80" role="list">
                    <li className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Track daily progress</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Compete with friends</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Year-round challenges</span>
                    </li>
                </ul>
            </div>
        </section>
    );
}
