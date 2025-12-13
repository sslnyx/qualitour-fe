import { getPosts, getTours, getTourTagBySlug, WPPost, WPTour } from '@/lib/wordpress';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import { formatDate } from '@/lib/utils';
import FeaturedToursCarousel from '@/components/FeaturedToursCarousel';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { getLocalePrefix } from '@/i18n/config';
import TransferBookingModalButton from '@/components/TransferBookingModalButton';
import HeroBackground from '@/assets/dimitar-donovski-h9Zr7Hq8yaA-unsplash-scaled-e1698877564378.webp';

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const localePrefix = getLocalePrefix(lang);
  
  let posts: WPPost[] = [];
  let tours: WPTour[] = [];
  let error: string | null = null;
  let toursError: string | null = null;

  try {
    posts = await getPosts({ per_page: 6 }, lang);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to fetch posts';
    console.error('Error fetching posts:', e);
  }

  try {
    // Fetch ALL tours tagged as "featured" for the carousel
    const featuredTag = await getTourTagBySlug('featured-tour');
    
    if (featuredTag) {
      tours = await getTours({ 
        per_page: 12, // Keep homepage light; tag currently has ~11 tours
        tour_tag: featuredTag.id,
        _embed: true
      }, lang);
    } else {
      // Fallback: show latest tours if no featured tag exists
      tours = await getTours({ per_page: 12, _embed: true }, lang);
    }
  } catch (e) {
    toursError = e instanceof Error ? e.message : 'Failed to fetch tours';
    console.error('Error fetching tours:', e);
  }

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-bottom bg-no-repeat text-white"
        style={{
          backgroundImage: `url('${HeroBackground.src}')`,
          paddingTop: '165px',
          paddingBottom: '165px',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center" style={{ paddingBottom: '50px' }}>
            <h2 className="font-kaushan text-white" style={{ fontSize: '60px', fontWeight: 600, textTransform: 'none' }}>
              Explore Again
            </h2>
            <span className="block text-white" style={{ fontSize: '35px', fontWeight: 600, fontStyle: 'normal', marginTop: '5px' }}>
              Discover and book amazing trips
            </span>
          </div>
          <div className="max-w-4xl mx-auto">
            <form className="bg-white rounded-md p-2 flex flex-col md:flex-row items-center gap-0.5 shadow-lg" action={`/${lang}/search-tours/`} method="GET">
              <div className="relative grow w-full md:w-auto">
                <input
                  type="text"
                  name="tour-search"
                  placeholder="Keywords"
                  className="w-full px-4 py-3 text-gray-700 focus:outline-none rounded-l-md"
                />
              </div>
              <div className="relative grow w-full md:w-auto">
                <select 
                  name="tax-tour_category"
                  className="w-full px-4 py-3 text-gray-700 bg-white focus:outline-none appearance-none"
                >
                  <option value="">{dict.tours.category}</option>
                  <option value="1-day-tour">1 Day Tour</option>
                  <option value="2-3-days-tours">2-3 Days Tours</option>
                  <option value="2-4-hour-tour">2-4 hour tour</option>
                  <option value="4-6-days-tours">4-6 Days Tours</option>
                  <option value="7-9-days-tours">7-9 Days Tours</option>
                  <option value="viking-tours">Viking Tours</option>
                </select>
                <svg className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="shrink-0">
                <button type="submit" className="w-full md:w-auto bg-[#f7941e] hover:bg-[#e68a1c] text-white px-8 py-3 font-semibold uppercase transition-colors rounded-r-md">
                  {dict.common.search}
                </button>
              </div>
            </form>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <div className="relative">
        <section 
          className="bg-[#f7941e] text-white rounded-md mx-auto relative z-20"
          style={{
            marginTop: '-40px',
            marginRight: 'auto',
            marginLeft: 'auto',
            padding: '50px 20px 0px 30px',
            maxWidth: '1200px',
            borderRadius: '3px'
          }}
        >
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4" style={{ paddingBottom: '30px' }}>
                <i className="fa fa-map-marker" style={{ color: '#ffffff', fontSize: '17px' }}></i>
                <div>
                  <h3 className="font-bold" style={{ fontSize: '13px', letterSpacing: '2px', marginBottom: '10px' }}>GUIDED TOURS</h3>
                  <p className="text-sm" style={{ textTransform: 'none' }}>Explore the best of Canada with experienced local tour guides</p>
                  <Link href={`/${lang}/tours`} className="text-white underline hover:no-underline text-sm mt-2 inline-block">
                    Browse Tours →
                  </Link>
                </div>
              </div>
              <div className="flex items-start gap-4" style={{ paddingBottom: '30px' }}>
                <i className="fa fa-bus" style={{ color: '#ffffff', fontSize: '17px' }}></i>
                <div>
                  <h3 className="font-bold" style={{ fontSize: '13px', letterSpacing: '2px', marginBottom: '10px' }}>MINI TOUR</h3>
                  <p className="text-sm" style={{ textTransform: 'none' }}>Travel in small group tours with family and friends only</p>
                </div>
              </div>
              <div className="flex items-start gap-4" style={{ paddingBottom: '30px' }}>
                <i className="fa fa-snowflake-o" style={{ color: '#ffffff', fontSize: '17px' }}></i>
                <div>
                  <h3 className="font-bold" style={{ fontSize: '13px', letterSpacing: '2px', marginBottom: '10px' }}>SKI SHUTTLES</h3>
                  <p className="text-sm" style={{ textTransform: 'none' }}>Private transfers between Vancouver and your favourite ski resorts</p>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </div>

      {/* Private Transfers Section */}
      <section className="py-16" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
        <Container>
          <div className="text-center mb-0" style={{ paddingBottom: '0px' }}>
            <h3 className="text-text-heading" style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '0px', textTransform: 'none' }}>
              {dict.navigation.privateTransfers}
            </h3>
            <p className="text-gray-400 italic mt-2">
              {lang === 'zh'
                ? '小团体私人接送（最多可容纳 14 人）'
                : 'We specialize in small group private transfers which may accommodate up to 14 people'}
            </p>
          </div>

          <div style={{ paddingTop: '30px' }}></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Transfer 1 */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <h3 className="text-text-heading mb-4" style={{ fontSize: '20px', fontWeight: 500, textTransform: 'none', lineHeight: '1.6' }}>
                Vancouver (YVR) Airport<br />
                to<br />
                Whistler
              </h3>
              <div className="text-gray-500" style={{ fontSize: '16px', fontStyle: 'normal', marginBottom: '18px' }}>
                {lang === 'zh' ? '每车 $465 起' : 'From $465 (per vehicle)'}
              </div>
              <TransferBookingModalButton
                label={lang === 'zh' ? '立即预订（11座）' : 'Book Now (11-seater)'}
                activityId="18"
                localePrefix={localePrefix}
                lang={lang}
              />
            </div>

            {/* Transfer 2 */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <h3 className="text-text-heading mb-4" style={{ fontSize: '20px', fontWeight: 500, textTransform: 'none', lineHeight: '1.6' }}>
                Greater Vancouver<br />
                to<br />
                Whistler
              </h3>
              <div className="text-gray-500" style={{ fontSize: '16px', fontStyle: 'normal', marginBottom: '18px' }}>
                {lang === 'zh' ? '每车 $435 起' : 'From $435 (per vehicle)'}
              </div>
              <TransferBookingModalButton
                label={lang === 'zh' ? '立即预订（11座）' : 'Book Now (11-seater)'}
                activityId="16"
                localePrefix={localePrefix}
                lang={lang}
              />
            </div>

            {/* Transfer 3 */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <h3 className="text-text-heading mb-4" style={{ fontSize: '20px', fontWeight: 500, textTransform: 'none', lineHeight: '1.6' }}>
                Whistler<br />
                to<br />
                YVR Airport / Greater Vancouver
              </h3>
              <div className="text-gray-500" style={{ fontSize: '16px', fontStyle: 'normal', marginBottom: '18px' }}>
                {lang === 'zh' ? '每车 $435 起' : 'From $435 (per vehicle)'}
              </div>
              <TransferBookingModalButton
                label={lang === 'zh' ? '立即预订（11座）' : 'Book Now (11-seater)'}
                activityId="20"
                localePrefix={localePrefix}
                lang={lang}
              />
            </div>
          </div>

          <div className="text-center mt-8">
            <Link 
              className="inline-flex items-center gap-2 text-[#f7941e] hover:text-[#e68a1c] transition-colors font-medium"
              href={`${localePrefix}/private-transfers`}
              style={{ fontSize: '15px' }}
            >
              View All Transfers <i className="fa fa-arrow-right"></i>
            </Link>
          </div>
        </Container>
      </section>

      {/* Featured Tours Section */}
      <section className="py-16 bg-white overflow-hidden">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-heading">{dict.tours.featured}</h2>
            <p className="text-text-muted mt-2">Discover our most popular tour packages</p>
          </div>

          {toursError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
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
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              <p>No featured tours found. Tag some tours with "Featured Tour" in WordPress.</p>
            </div>
          )}

          {/* View All Tours Link */}
          {tours.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href={`/${lang}/tours`}
                className="inline-flex items-center gap-2 text-[#f7941e] hover:text-[#e68a1c] transition-colors font-medium text-lg"
              >
                {dict.tours.all} <i className="fa fa-arrow-right"></i>
              </Link>
            </div>
          )}
        </Container>
      </section>

      {/* Latest Posts Section */}
      {/* <section className="py-16 bg-gray-100">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-heading">Latest Travel News & Tips</h2>
            <p className="text-text-muted mt-2">Read our latest articles for travel inspiration and advice.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
              <p className="font-bold">Error loading posts</p>
              <p className="text-sm">{error}</p>
              <p className="text-sm mt-2">
                Make sure WordPress is running at: {process.env.NEXT_PUBLIC_WORDPRESS_API_URL}
              </p>
            </div>
          )}

          {!error && posts.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              <p>No posts found. Create some posts in WordPress to see them here.</p>
            </div>
          )}

          {posts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-card overflow-hidden shadow-card hover:shadow-lg transition-shadow group"
                >
                  {post._embedded?.['wp:featuredmedia']?.[0] && (
                    <div className="relative overflow-hidden">
                      <img
                        src={post._embedded['wp:featuredmedia'][0].source_url}
                        alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
                        className="w-full h-full object-cover aspect-video transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="text-sm text-primary mb-2 font-semibold">
                      {post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Uncategorized'}
                    </div>
                    <Link href={`/${lang}/posts/${post.slug}`}>
                      <h3 className="text-xl font-bold text-text-heading mb-2 group-hover:text-primary transition-colors"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                      />
                    </Link>
                    <div
                      className="text-text line-clamp-3 mb-4"
                      dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                    />
                    <div className="flex items-center justify-between text-sm text-gray-500 border-t border-border pt-4 mt-4">
                      <time dateTime={post.date}>
                        {formatDate(post.date)}
                      </time>
                      {post._embedded?.author?.[0] && (
                        <span className="font-medium">{post._embedded.author[0].name}</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {posts.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href={`/${lang}/blog`}
                className="inline-block px-8 py-3 bg-primary text-white rounded-md font-semibold uppercase tracking-wider hover:bg-primary-dark transition-colors"
              >
                View All Posts
              </Link>
            </div>
          )}
        </Container>
      </section> */}
    </>
  );
}
