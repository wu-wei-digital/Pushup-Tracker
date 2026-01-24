import CTASectionButtons from "./CTASectionButtons";

export default function CTASection() {
    return (
        <section className="py-20 bg-white" aria-labelledby="cta-heading">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 id="cta-heading" className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
          Ready to Start Your Journey?
                </h2>

                <p className="text-lg text-sage-600 max-w-xl mx-auto mb-10">
          Join others tracking their pushup progress today. It&apos;s free to get started.
                </p>

                <nav className="flex flex-col sm:flex-row gap-4 justify-center items-center" aria-label="Call to action">
                    <CTASectionButtons />
                </nav>
            </div>
        </section>
    );
}
