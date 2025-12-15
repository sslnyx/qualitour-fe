import { getTours, getTourTagBySlug, WPTour } from '@/lib/wordpress';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import FeaturedToursCarousel from '@/components/FeaturedToursCarousel';
import FeaturedGoogleReview from '@/components/FeaturedGoogleReview';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocalePrefix } from '@/i18n/config';
import TransferBookingModalButton from '@/components/TransferBookingModalButton';
import HeroBackground from '@/assets/dimitar-donovski-h9Zr7Hq8yaA-unsplash-scaled-e1698877564378.webp';

// Pre-generate homepage for both languages at build time
// This eliminates CPU usage for most requests (served from CDN)
export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'zh' },
  ];
}

// Revalidate the homepage every 15 minutes
// This means most requests are served from static cache with 0 CPU
export const revalidate = 900;

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const localePrefix = getLocalePrefix(lang);

  // Fetch dictionary and tag in PARALLEL to minimize CPU time
  // NOTE: Removed getPosts() call - posts were fetched but never used!
  // This saves ~2-3ms of CPU time per request
  const [dict, featuredTagResult] = await Promise.all([
    getDictionary(lang),
    getTourTagBySlug('featured-tour').catch(() => null),
  ]);

  // Now fetch tours (depends on tag result, but tag query is edge-cached)
  let tours: WPTour[] = [];
  let toursError: string | null = null;

  try {
    if (featuredTagResult) {
      tours = await getTours({ per_page: 12, tour_tag: featuredTagResult.id }, lang);
    } else {
      tours = await getTours({ per_page: 12 }, lang);
    }
  } catch (e) {
    toursError = e instanceof Error ? e.message : 'Failed to fetch tours';
    console.error('Error fetching tours:', e);
  }

  const t = {
    heroTagline: 'QUALITOUR',
    heroTitle: lang === 'zh' ? '重新出發' : 'Explore Again',
    heroSubtitle: lang === 'zh' ? '发现并预订难忘的旅行体验' : 'Discover and book unforgettable travel experiences',
    searchPlaceholder: lang === 'zh' ? '搜索目的地或行程...' : 'Search destinations or tours...',
    whyChooseUs: lang === 'zh' ? '为什么选择我们' : 'Why Choose Qualitour',
    guidedTours: lang === 'zh' ? '专业导游' : 'Professional Guides',
    guidedToursDesc: lang === 'zh' ? '经验丰富的本地导游带您探索' : 'Experienced local guides for authentic experiences',
    smallGroups: lang === 'zh' ? '小团出行' : 'Small Groups',
    smallGroupsDesc: lang === 'zh' ? '亲密的家庭式小团体旅行' : 'Intimate travel with family and friends',
    premiumService: lang === 'zh' ? '优质服务' : 'Premium Service',
    premiumServiceDesc: lang === 'zh' ? '从预订到旅程结束全程服务' : '24/7 support from booking to return',
    bestValue: lang === 'zh' ? '超值价格' : 'Best Value',
    bestValueDesc: lang === 'zh' ? '质优价廉的旅游体验' : 'Quality experiences at competitive prices',
    privateTransfers: lang === 'zh' ? '私人接送服务' : 'Private Transfer Services',
    transfersSubtitle: lang === 'zh' ? '小团体私人接送，最多可容纳14人' : 'Specialized in small group transfers for up to 14 passengers',
    perVehicle: lang === 'zh' ? '每车' : 'per vehicle',
    viewAllTransfers: lang === 'zh' ? '查看全部接送服务' : 'View All Transfers',
    featuredTours: lang === 'zh' ? '精选行程' : 'Featured Tours',
    featuredToursSubtitle: lang === 'zh' ? '探索我们最受欢迎的旅游套餐' : 'Explore our most popular tour packages',
    viewAllTours: lang === 'zh' ? '查看全部行程' : 'View All Tours',
    customerReviews: lang === 'zh' ? '客户评价' : 'What Our Customers Say',
    reviewsSubtitle: lang === 'zh' ? '真实旅客的真实体验' : 'Real experiences from real travelers',
    readyToExplore: lang === 'zh' ? '准备好开始探索了吗？' : 'Ready to Start Your Adventure?',
    ctaSubtitle: lang === 'zh' ? '让我们帮您规划一次难忘的旅程' : 'Let us help you plan an unforgettable journey',
    browseAllTours: lang === 'zh' ? '浏览所有行程' : 'Browse All Tours',
    contactUs: lang === 'zh' ? '联系我们' : 'Contact Us',
  };

  const whyUsItems = [
    { icon: 'explore', title: t.guidedTours, desc: t.guidedToursDesc },
    { icon: 'groups', title: t.smallGroups, desc: t.smallGroupsDesc },
    { icon: 'support_agent', title: t.premiumService, desc: t.premiumServiceDesc },
    { icon: 'verified', title: t.bestValue, desc: t.bestValueDesc },
  ];

  const transferRoutes = [
    {
      from: 'Vancouver Airport (YVR)',
      to: 'Whistler',
      price: '465',
      activityId: '18',
      icon: 'flight_land',
    },
    {
      from: 'Greater Vancouver',
      to: 'Whistler',
      price: '435',
      activityId: '16',
      icon: 'downhill_skiing',
    },
    {
      from: 'Whistler',
      to: 'YVR / Vancouver',
      price: '435',
      activityId: '20',
      icon: 'flight_takeoff',
    },
  ];

  return (
    <>
      {/* Hero Section - Premium Dark Theme */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <img
          src={HeroBackground.src}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-bottom"
          style={{ zIndex: -2 }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" style={{ zIndex: -1 }} />

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#f7941e]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-64 h-64 bg-[#f7941e]/10 rounded-full blur-3xl" />

        <Container className="relative z-10 py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#f7941e]/20 backdrop-blur-sm rounded-full text-[#f7941e] text-sm font-bold tracking-widest mb-6">
              <span className="material-icons text-lg">public</span>
              {t.heroTagline}
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-kaushan text-white mb-6 leading-tight">
              {t.heroTitle}
            </h1>

            <p className="text-xl md:text-2xl text-white/80 mb-10 leading-relaxed">
              {t.heroSubtitle}
            </p>

            {/* Search Bar */}
            <form
              className="bg-white/10 backdrop-blur-md rounded-2xl p-2 flex flex-col md:flex-row items-center gap-2 border border-white/20"
              action={`/${lang}/tours`}
              method="GET"
            >
              <div className="relative grow w-full md:w-auto">
                <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-white/50">search</span>
                <input
                  type="text"
                  name="tour-search"
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-white/50 focus:outline-none"
                />
              </div>
              <div className="relative w-full md:w-auto">
                <select
                  name="tax-tour_category"
                  className="w-full md:w-48 px-4 py-4 text-white bg-white/10 rounded-xl focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="" className="text-gray-900">{dict.tours.category}</option>
                  <option value="1-day-tour" className="text-gray-900">1 Day Tour</option>
                  <option value="2-3-days-tours" className="text-gray-900">2-3 Days Tours</option>
                  <option value="4-6-days-tours" className="text-gray-900">4-6 Days Tours</option>
                  <option value="7-9-days-tours" className="text-gray-900">7-9 Days Tours</option>
                </select>
                <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">expand_more</span>
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#f7941e] to-[#ff6b35] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="material-icons">search</span>
                  {dict.common.search}
                </span>
              </button>
            </form>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-8 mt-10 items-center">
              <div className="text-white/90">
                <span className="text-3xl font-bold text-[#f7941e]">500+</span>
                <p className="text-white/60 text-sm">{lang === 'zh' ? '满意客户' : 'Happy Travelers'}</p>
              </div>
              <div className="text-white/90">
                <span className="text-3xl font-bold text-[#f7941e]">50+</span>
                <p className="text-white/60 text-sm">{lang === 'zh' ? '精选行程' : 'Tour Packages'}</p>
              </div>
              <div className="text-white/90">
                <div className="flex gap-1 min-h-[35.5px] items-center">
                  {[...Array(4)].map((_, i) => (
                    <span key={i} className="material-icons text-2xl text-[#f7941e]">star</span>
                  ))}
                  <span className="material-icons text-2xl text-transparent bg-clip-text bg-[linear-gradient(to_right,#f7941e_80%,rgba(255,255,255,0.4)_80%)]">
                    star
                  </span>
                </div>
                <p className="text-white/60 text-sm">{lang === 'zh' ? '客户评分' : 'Customer Rating'}</p>
              </div>
            </div>
          </div>
        </Container>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
          <span className="material-icons text-3xl">keyboard_arrow_down</span>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-orange-50 to-transparent" />

        <Container className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.whyChooseUs}</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#f7941e] to-[#ff6b35] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyUsItems.map((item, idx) => (
              <div key={idx} className="group text-center p-8 rounded-2xl hover:bg-gradient-to-br hover:from-orange-50 hover:to-amber-50 transition-all duration-300">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#f7941e] to-[#ff6b35] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200/50 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-icons text-white text-3xl">{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Private Transfers Section */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <span className="text-[#f7941e] font-bold tracking-widest uppercase text-sm mb-2 block">
              {dict.navigation.privateTransfers}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.privateTransfers}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{t.transfersSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {transferRoutes.map((route, idx) => (
              <div
                key={idx}
                className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#f7941e]/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#f7941e]/10 to-transparent rounded-bl-full" />

                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-[#f7941e]/10 to-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-icons text-[#f7941e] text-2xl">{route.icon}</span>
                </div>

                {/* Route */}
                <div className="mb-4">
                  <div className="font-bold text-gray-900 text-lg leading-relaxed">
                    {route.from}
                  </div>
                  <div className="text-[#f7941e] font-bold my-1">→</div>
                  <div className="font-bold text-gray-900 text-lg">
                    {route.to}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">${route.price}</span>
                    <span className="text-gray-500 text-sm">{t.perVehicle}</span>
                  </div>
                </div>

                {/* Booking button */}
                <TransferBookingModalButton
                  label={lang === 'zh' ? '立即预订（11座）' : 'Book Now (11-seater)'}
                  activityId={route.activityId}
                  localePrefix={localePrefix}
                  lang={lang}
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href={`${localePrefix}/private-transfers`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-100 hover:bg-[#f7941e] text-gray-700 hover:text-white font-semibold rounded-full transition-all duration-300"
            >
              <span className="material-icons">arrow_forward</span>
              {t.viewAllTransfers}
            </Link>
          </div>
        </Container>
      </section>

      {/* Featured Tours Section */}
      <section className="py-20 bg-white overflow-hidden">
        <Container>
          <div className="text-center mb-16">
            <span className="text-[#f7941e] font-bold tracking-widest uppercase text-sm mb-2 block">
              {dict.tours.featured}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.featuredTours}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{t.featuredToursSubtitle}</p>
          </div>

          {toursError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8">
              <p className="font-bold">Error loading tours</p>
              <p className="text-sm">
                {process.env.NODE_ENV === 'development'
                  ? toursError
                  : 'Tours are temporarily unavailable.'}
              </p>
            </div>
          )}

          {!toursError && tours.length > 0 && (
            <FeaturedToursCarousel tours={tours} lang={lang} />
          )}

          {!toursError && tours.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl">
              <p>No featured tours found. Tag some tours with &quot;Featured Tour&quot; in WordPress.</p>
            </div>
          )}

          {tours.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href={`/${lang}/tours`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#f7941e] to-[#ff6b35] text-white font-bold rounded-full hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300"
              >
                <span className="material-icons">explore</span>
                {t.viewAllTours}
              </Link>
            </div>
          )}
        </Container>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <Container>
          <div className="text-center mb-12">
            <span className="text-[#f7941e] font-bold tracking-widest uppercase text-sm mb-2 block">
              {lang === 'zh' ? '客户反馈' : 'TESTIMONIALS'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.customerReviews}</h2>
            <p className="text-white/60 max-w-2xl mx-auto">{t.reviewsSubtitle}</p>
            <div className="w-20 h-1 bg-gradient-to-r from-[#f7941e] to-[#ff6b35] mx-auto rounded-full mt-4" />
          </div>

          <div className="max-w-7xl mx-auto bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10">
            <FeaturedGoogleReview lang={lang} mode="all" />
          </div>
        </Container>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#f7941e] to-[#ff6b35] relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#fff_1px,transparent_1px)] [background-size:24px_24px]" />

        <Container className="relative z-10">
          <div className="text-center text-white max-w-3xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="material-icons text-white text-4xl">flight_takeoff</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">{t.readyToExplore}</h2>
            <p className="text-xl opacity-90 mb-10">{t.ctaSubtitle}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={`${localePrefix}/tours`}
                className="inline-flex items-center gap-2 px-10 py-4 bg-white text-[#f7941e] font-bold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <span className="material-icons">explore</span>
                {t.browseAllTours}
              </Link>
              <Link
                href={`${localePrefix}/contact`}
                className="inline-flex items-center gap-2 px-10 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                <span className="material-icons">mail</span>
                {t.contactUs}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
