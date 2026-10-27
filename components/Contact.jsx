import AnimatedCTAButton from "./ui/AnimatedButton";

const Contact = ({ onOpenOverlay }) => (
    <section id="contact" className="bg-brand-surface scroll-mt-16 ">
        <div className="container mx-auto px-6 py-20 lg:py-24 text-center fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 ">
                Have a project in mind?
                {' '}
                <span className="bg-gradient-to-r from-brand-blue to-cyan-400 text-transparent bg-clip-text whitespace-nowrap">
                    Let's talk
                </span>.</h2>
            <p className="text-lg text-brand-gray max-w-2xl mx-auto mb-8">
                Tell me a little about what you need.
                <br />
                I usually reply within two working days.
            </p>
            <AnimatedCTAButton className="font-medium text-lg" onClick={onOpenOverlay}>Get in touch</AnimatedCTAButton>
        </div>
    </section>
);

export default Contact;