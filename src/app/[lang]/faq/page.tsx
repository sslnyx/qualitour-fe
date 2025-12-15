import { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Link from 'next/link';
import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import { getLocalePrefix } from '@/i18n/config';
import { FAQCategories, FAQQuickLinks } from '@/components/FAQAccordion';
import HeroBackground from '@/assets/dimitar-donovski-h9Zr7Hq8yaA-unsplash-scaled-e1698877564378.webp';

export const metadata: Metadata = {
    title: 'Frequently Asked Questions | Qualitour',
    description: 'Find answers to common questions about Qualitour tours, bookings, cancellations, payment methods, and travel requirements.',
};

export default async function FAQPage({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    const { lang } = await params;
    const localePrefix = getLocalePrefix(lang);

    return (
        <main className="flex-grow">
            {/* Hero Section */}
            <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <Image
                    src={HeroBackground}
                    alt=""
                    fill
                    className="object-cover object-bottom"
                    placeholder="blur"
                    priority
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />

                <Container className="relative z-10 py-20">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-5 py-2.5 mb-8 border border-white/20">
                            <span className="material-icons text-[#f7941e] text-xl">help_outline</span>
                            <span className="text-white font-medium tracking-wide">Help Center</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-xl">
                            Frequently Asked{' '}
                            <span className="text-[#f7941e]">Questions</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed font-light">
                            Everything you need to know about your journey with Qualitour.
                        </p>

                        {/* Quick Jump Links */}
                        <FAQQuickLinks />
                    </div>
                </Container>
            </section>

            {/* FAQ Content */}
            <section className="py-16 md:py-24 bg-gray-50">
                <Container>
                    <FAQCategories />
                </Container>
            </section>

            {/* Contact CTA Section */}
            <section className="py-20 bg-gradient-to-r from-[#f7941e] to-[#ff6b35] relative overflow-hidden">
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#fff_1px,transparent_1px)] [background-size:24px_24px]" />

                <Container className="relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <span className="material-icons text-white text-4xl">support_agent</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            Still Have Questions?
                        </h2>
                        <p className="text-xl text-white/90 mb-10">
                            Our friendly team is here to help! Contact us and we&apos;ll get back to you as soon as possible.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href={`${localePrefix}/contact`}
                                className="inline-flex items-center gap-2 bg-white text-[#f7941e] px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                            >
                                <span className="material-icons">mail</span>
                                Contact Us
                            </Link>
                            <a
                                href="tel:+17789456000"
                                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-10 py-4 rounded-full font-bold text-lg border border-white/30 hover:bg-white/30 transition-all"
                            >
                                <span className="material-icons">phone</span>
                                Call (778) 945-6000
                            </a>
                        </div>
                    </div>
                </Container>
            </section>
        </main>
    );
}
