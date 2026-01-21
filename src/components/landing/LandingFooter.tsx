"use client";

export default function LandingFooter() {
    return (
        <footer className="py-8 bg-background border-t border-sage-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-sm text-sage-400">
          A{" "}
                    <a
                        href="https://wuwei.digital"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sage-500 hover:text-coral-500 transition-colors"
                    >
            Wu Wei Digital
                    </a>
                    {" "}project
                </p>
                <p className="text-xs text-sage-300 mt-2">
          &copy; {new Date().getFullYear()} Pushup Tracker. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
