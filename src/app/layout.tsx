import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://pushups.wuwei.digital"),
    title: "Pushup Tracker | Wu Wei Digital",
    description: "Social, gamified pushup tracking app with challenges, achievements, and friends",
    keywords: ["pushup", "fitness", "tracker", "workout", "exercise", "challenge", "wu wei digital"],
    applicationName: "Pushup Tracker",
    creator: "Wu Wei Digital",
    publisher: "Wu Wei Digital",
    category: "Fitness",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    alternates: {
        canonical: "https://pushups.wuwei.digital",
    },
    icons: {
        icon: "/pushup-tracker-logo-light.png",
        apple: "/pushup-tracker-logo-light.png",
    },
    manifest: "/manifest.json",
    openGraph: {
        title: "Pushup Tracker | Wu Wei Digital",
        description: "Social, gamified pushup tracking app with challenges, achievements, and friends",
        url: "https://pushups.wuwei.digital",
        siteName: "Pushup Tracker",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Pushup Tracker - Track your progress, compete with friends",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Pushup Tracker | Wu Wei Digital",
        description: "Social, gamified pushup tracking app with challenges, achievements, and friends",
        images: ["/og-image.png"],
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            "@id": "https://pushups.wuwei.digital/#organization",
            name: "Wu Wei Digital",
            url: "https://wuwei.digital",
            logo: {
                "@type": "ImageObject",
                url: "https://pushups.wuwei.digital/pushup-tracker-logo-light.png",
            },
        },
        {
            "@type": "WebApplication",
            "@id": "https://pushups.wuwei.digital/#webapp",
            name: "Pushup Tracker",
            description: "Social, gamified pushup tracking app with challenges, achievements, and friends",
            url: "https://pushups.wuwei.digital",
            applicationCategory: "HealthApplication",
            operatingSystem: "Web",
            offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
            },
            publisher: {
                "@id": "https://pushups.wuwei.digital/#organization",
            },
            aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "150",
            },
        },
        {
            "@type": "SoftwareApplication",
            "@id": "https://pushups.wuwei.digital/#software",
            name: "Pushup Tracker",
            applicationCategory: "HealthApplication",
            applicationSubCategory: "Fitness",
            operatingSystem: "Web Browser",
            offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
            },
            featureList: [
                "Track daily pushups",
                "Gamification with XP and levels",
                "Achievements and badges",
                "Leaderboards",
                "Social features with friends",
                "Team challenges",
                "Progress visualization",
            ],
        },
        {
            "@type": "WebSite",
            "@id": "https://pushups.wuwei.digital/#website",
            url: "https://pushups.wuwei.digital",
            name: "Pushup Tracker",
            publisher: {
                "@id": "https://pushups.wuwei.digital/#organization",
            },
        },
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background`}>
                <AuthProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
