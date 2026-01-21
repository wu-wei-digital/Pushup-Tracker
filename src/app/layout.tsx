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
    icons: {
        icon: "/pushup-tracker-logo-light.png",
        apple: "/pushup-tracker-logo-light.png",
    },
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

export default function RootLayout({
    children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang="en">
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
