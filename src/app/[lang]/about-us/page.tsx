import { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Link from 'next/link';
import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import { getLocalePrefix } from '@/i18n/config';
import TourReviews from '@/components/TourReviews';
import PageHero from '@/components/PageHero';
import miniTourImg from '../../../../public/mini-tour.jpg';
import skiShuttleImg from '../../../../public/ski-shuttle.jpg';

export const metadata: Metadata = {
  title: 'About Us | Qualitour',
  description: 'Discover the story behind Qualitour, Vancouver\'s premier tour operator dedicated to authentic, safe, and personalized Canadian travel experiences.',
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const localePrefix = getLocalePrefix(lang);

  // Translation helpers (placeholder for real i18n implementation if needed)
  const t = {
    title: lang === 'zh' ? '关于我们' : 'About Qualitour',
    subtitle: lang === 'zh' ? '探索我们对真实旅行体验的热情' : 'Crafting Unforgettable Canadian Journeys Since inception.',
    mission: lang === 'zh' ? '我们的使命' : 'Our Mission',
    missionText: lang === 'zh' ? 'Qualitour 总部位于温哥华，为您提供真实的旅游体验...' : 'To connect travelers with the soul of Canada through authentic, handcrafted, and personalized experiences that create memories to last a lifetime.',
  };

  return (
    <main className="flex-grow">
      {/* Premium Hero Section */}
      <PageHero
        image="/about-hero.png"
        title={t.title}
        subtitle={t.subtitle}
        badge={{ icon: 'groups', text: 'About Us' }}
      />

      {/* Mission Statement */}
      <section className="py-20 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-[#f7941e] font-bold tracking-widest uppercase text-sm mb-4 block">
              {t.mission}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 leading-relaxed">
              "{t.missionText}"
            </h2>
            <div className="w-24 h-1 bg-[#f7941e] mx-auto mt-10 rounded-full"></div>
          </div>
        </Container>
      </section>

      {/* Core Values / Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: 'verified', title: 'Authenticity', desc: 'Handcrafted itineraries that go beyond the tourist traps to reveal the true spirit of the destination.' },
              { icon: 'settings_suggest', title: 'Personalization', desc: 'Tailor-made experiences designed to match your pace, interests, and travel style perfectly.' },
              { icon: 'admin_panel_settings', title: 'Safety First', desc: 'Your well-being is our top priority, with rigorous safety standards and experienced local guides.' },
              { icon: 'favorite', title: 'Passion', desc: 'Founded by travel enthusiasts who pour their heart into creating your dream vacation.' },
            ].map((value, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-[#f7941e]/10 rounded-full flex items-center justify-center text-[#f7941e] mb-6">
                  <span className="material-icons text-3xl">{value.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Visual Storytelling Section */}
      <section className="py-24 overflow-hidden">
        <Container>
          {/* Block 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-24">
            <div className="lg:w-1/2 relative group">
              <div className="absolute inset-0 bg-[#f7941e] rounded-2xl rotate-3 group-hover:rotate-2 transition-transform opacity-20"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                <Image
                  src={miniTourImg}
                  alt="Small group tour experience"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 relative">
                <span className="relative z-10">Who We Are</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Qualitour is a Vancouver-based tour operator dedicated to showcasing the very best of Canada. From the rugged peaks of the Rockies to the vibrant streets of Vancouver, we curate experiences that inspire.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We offer a wide range of tours including city sightseeing, pre/post cruise excursions, adventure hiking, wildlife eco-tours, and ski vacations. Every journey is an opportunity to connect with nature, culture, and each other.
              </p>
            </div>
          </div>

          {/* Block 2 (Reversed) */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
            <div className="lg:w-1/2 relative group">
              <div className="absolute inset-0 bg-blue-500 rounded-2xl -rotate-2 group-hover:-rotate-1 transition-transform opacity-10"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                <Image
                  src={skiShuttleImg}
                  alt="Private transfer service"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                More Than Just Tours
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We also specialize in seamless private transfers. Whether you need a hassle-free airport pickup, a cruise ship connection, or a comfortable ride to Whistler for a ski weekend, our fleet is at your service.
              </p>
              <ul className="space-y-4">
                {[
                  'Luxury fleet for maximum comfort',
                  'Professional, punctual drivers',
                  '24/7 Support for peace of mind'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <span className="material-icons text-[#f7941e]">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Services Showcase */}
      <section className="py-20 bg-gray-900 text-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Premium Services</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Experience the Qualitour difference with our range of specialized travel services.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <Link href={`${localePrefix}/tours`} className="group relative h-96 rounded-2xl overflow-hidden block">
              <Image src="/guide-tour.jpg" alt="Guided Tours" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="material-icons text-[#f7941e] text-4xl mb-4">tour</span>
                  <h3 className="text-2xl font-bold mb-2">Guided Tours</h3>
                  <p className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 text-sm">
                    Expertly led journeys through Canada's most iconic landscapes.
                  </p>
                </div>
              </div>
            </Link>

            {/* Service 2 */}
            <Link href={`${localePrefix}/tours`} className="group relative h-96 rounded-2xl overflow-hidden block">
              <Image src="/mini-tour.jpg" alt="Mini Tours" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="material-icons text-[#f7941e] text-4xl mb-4">groups</span>
                  <h3 className="text-2xl font-bold mb-2">Mini Groups</h3>
                  <p className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 text-sm">
                    Intimate, flexible travel experiences for friends and families.
                  </p>
                </div>
              </div>
            </Link>

            {/* Service 3 */}
            <Link href={`${localePrefix}/private-transfers`} className="group relative h-96 rounded-2xl overflow-hidden block">
              <Image src="/ski-shuttle.jpg" alt="Private Transfers" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="material-icons text-[#f7941e] text-4xl mb-4">directions_car</span>
                  <h3 className="text-2xl font-bold mb-2">Private Transfers</h3>
                  <p className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 text-sm">
                    Comfortable, reliable transportation for any occasion.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </Container>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-gray-50">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {lang === 'zh' ? '客户评价' : 'What Our Travelers Say'}
            </h2>
            <div className="w-20 h-1 bg-[#f7941e] mx-auto rounded-full"></div>
          </div>
          <div className="max-w-7xl mx-auto">
            <TourReviews limit={6} />
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#f7941e_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <Container className="relative z-10">
          <div className="bg-[#f7941e] rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Start Your Adventure?</h2>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Let us help you create the perfect itinerary. Contact us today or browse our curated selection of tours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`${localePrefix}/tours`}
                className="px-8 py-4 bg-white text-[#f7941e] font-bold rounded-full hover:bg-gray-100 hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                Browse All Tours
              </Link>
              <Link
                href={`${localePrefix}/contact`}
                className="px-8 py-4 bg-[#d67a1a] text-white font-bold rounded-full hover:bg-[#c56810] hover:shadow-lg transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-white/20"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

