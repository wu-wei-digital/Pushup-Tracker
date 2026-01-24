import {
    HeroSection,
    FeaturesSection,
    BenefitsSection,
    PushForBetterSection,
    CTASection,
    LandingFooter,
} from "@/components/landing";

export default function Home() {
    return (
        <main className="min-h-screen bg-background">
            <HeroSection />
            <FeaturesSection />
            <BenefitsSection />
            <PushForBetterSection />
            <CTASection />
            <LandingFooter />
        </main>
    );
}
