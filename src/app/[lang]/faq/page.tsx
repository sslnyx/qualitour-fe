import { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Link from 'next/link';
import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import { getLocalePrefix } from '@/i18n/config';
import { FAQCategories, FAQQuickLinks } from '@/components/FAQAccordion';
import PageHero from '@/components/PageHero';

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
            {/* Hero Section */}
            <PageHero
                image="/faq-hero.png"
                title={
                    <>
                        Frequently Asked <span className="text-[#f7941e]">Questions</span>
                    </>
                }
                subtitle="Everything you need to know about your journey with Qualitour."
                badge={{ icon: 'help_outline', text: 'Help Center' }}
            >
                {/* Quick Jump Links */}
                <div className="mt-8">
                    <FAQQuickLinks />
                </div>
            </PageHero>

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
