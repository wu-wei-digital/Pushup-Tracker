import Image from "next/image";
import HeroSectionCTA from "./HeroSectionCTA";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden py-20 sm:py-32" aria-labelledby="hero-heading">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-sage-50 via-background to-coral-50/30" aria-hidden="true" />

            {/* Floating decorative circles */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-sage-200/30 rounded-full blur-3xl animate-float" aria-hidden="true" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-coral-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} aria-hidden="true" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sage-100/40 rounded-full blur-3xl" aria-hidden="true" />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Logo */}
                <div className="inline-block mb-8 animate-fade-in">
                    <Image
                        src="/pushup-tracker-logo-light.png"
                        alt="Pushup Tracker Logo - Track your fitness journey"
                        width={120}
                        height={120}
                        className="drop-shadow-lg"
                        priority
                    />
                </div>

                {/* Heading */}
                <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 animate-slide-up">
          Track Your Pushups,{" "}
                    <span className="bg-gradient-to-r from-sage-500 to-sage-600 bg-clip-text text-transparent">
            Transform Your Life
                    </span>
                </h1>

                {/* Subheading */}
                <p className="text-lg sm:text-xl text-sage-600 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          Join a community of fitness enthusiasts. Track progress, compete with friends, and achieve your goals.
                </p>

                {/* Auth-aware CTAs */}
                <nav className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: "0.2s" }} aria-label="Get started">
                    <HeroSectionCTA />
                </nav>
            </div>
        </section>
    );
}
