import { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { getLocalePrefix } from '@/i18n/config';
import { i18n } from '@/i18n/config';
import TourReviews from '@/components/TourReviews';

export const runtime = 'edge';
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export const metadata: Metadata = {
  title: 'About Us | Qualitour',
  description: 'Learn about Qualitour, a Vancouver-based tour operator offering authentic Canadian tours, private transfers, and customizable travel experiences.',
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const localePrefix = getLocalePrefix(lang);

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <Container>
          <h1 className="text-4xl md:text-5xl font-bold text-text-heading mb-4">About Us</h1>
          <p className="text-text-muted text-lg">Discover our story and passion for authentic travel experiences</p>
        </Container>
      </section>

      {/* Main Content Section */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-text-heading mb-6">Who We Are</h2>
              <p className="text-text text-lg mb-4">
                Qualitour is a tour operator based in Vancouver that provides authentic tour experiences. We offer a wide range of tours for you to explore the best of Canada, including city sightseeing tours, pre/post cruise tours, adventure tours, hiking tours, wildlife & eco tours, ski vacations, and more!
              </p>
              <p className="text-text text-lg mb-4">
                Our tours are customizable and ensure you can relax and enjoy a personalized tour experience.
              </p>
              <p className="text-text text-lg">
                At Qualitour, each tour is handcrafted by our passionate team and we are proud to deliver authentic tour experiences to you that create life-long memories. We look forward to welcoming you on board soon.
              </p>
            </div>

            {/* Private Transfers */}
            <div className="mb-12 bg-gray-50 p-8 rounded-lg">
              <h2 className="text-3xl font-bold text-text-heading mb-6">Private Transfers</h2>
              <p className="text-text text-lg">
                We also specialize in operating private transfers. Whether you are looking for hassle-free airport transfers, cruise ship transfers, or ski transfers, we have the perfect vehicles for your transportation needs.
              </p>
            </div>

            {/* Our Commitment */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-text-heading mb-6">Our Commitment</h2>
              <p className="text-text text-lg">
                We strive to provide the best services to our customers. Your satisfaction and safety are our top priorities, and we're dedicated to making every journey with Qualitour unforgettable.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-heading mb-4">Our Services</h2>
            <p className="text-text-muted text-lg">Experience the best of what Qualitour has to offer</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Guided Tours */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="material-icons text-white text-6xl">tour</span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-text-heading mb-3">Guided Tours</h3>
                <p className="text-text mb-6">
                  Explore the best of Canada with experienced local tour guides who know every hidden gem and story.
                </p>
                <Link
                  href={`${localePrefix}/tours`}
                  className="inline-flex items-center gap-2 text-[#f7941e] hover:text-[#e68a1c] font-semibold transition-colors"
                >
                  Learn More <span className="material-icons text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Mini Tours */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="material-icons text-white text-6xl">groups</span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-text-heading mb-3">Mini Tours</h3>
                <p className="text-text mb-6">
                  Travel in small private groups with family and friends only. Intimate experiences tailored to your pace.
                </p>
                <Link
                  href={`${localePrefix}/tours`}
                  className="inline-flex items-center gap-2 text-[#f7941e] hover:text-[#e68a1c] font-semibold transition-colors"
                >
                  Learn More <span className="material-icons text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Ski Shuttles */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <span className="material-icons text-white text-6xl">snowflake</span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-text-heading mb-3">Ski Shuttles</h3>
                <p className="text-text mb-6">
                  Private transfers between Vancouver and your favourite ski resorts. Comfortable and convenient service.
                </p>
                <Link
                  href={`${localePrefix}/private-transfers`}
                  className="inline-flex items-center gap-2 text-[#f7941e] hover:text-[#e68a1c] font-semibold transition-colors"
                >
                  Learn More <span className="material-icons text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Google Reviews Section */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-heading mb-4">
              {lang === 'zh' ? '客户评价' : 'Customer Reviews'}
            </h2>
            <p className="text-text-muted text-lg">
              {lang === 'zh' ? '看看我们的客户对我们的评价' : 'See what our customers think about us'}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <TourReviews limit={6} />
          </div>
        </Container>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 md:py-24 bg-[#f7941e]">
        <Container>
          <div className="text-center text-white max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready for Your Next Adventure?</h2>
            <p className="text-lg mb-8 opacity-90">
              Whether you're looking for guided tours, mini group experiences, or reliable transfers, Qualitour is here to make your journey unforgettable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`${localePrefix}/tours`}
                className="inline-block px-8 py-3 bg-white text-[#f7941e] font-bold rounded-md hover:bg-gray-100 transition-colors"
              >
                Browse Tours
              </Link>
              <Link
                href={`${localePrefix}/contact`}
                className="inline-block px-8 py-3 bg-[#d67a1a] text-white font-bold rounded-md hover:bg-[#c56810] transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
