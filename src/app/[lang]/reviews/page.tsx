import { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Link from 'next/link';
import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import { getLocalePrefix } from '@/i18n/config';
import { getBusinessReviews } from '@/lib/wordpress/api';
import PremiumReviewsGrid from '@/components/PremiumReviewsGrid';
import HeroBackground from '@/assets/dimitar-donovski-h9Zr7Hq8yaA-unsplash-scaled-e1698877564378.webp';

export const metadata: Metadata = {
  title: 'Customer Reviews | Qualitour',
  description: 'Read authentic reviews from our happy customers. See why travelers trust Qualitour for their tour experiences.',
};

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const localePrefix = getLocalePrefix(lang);

  // Fetch reviews
  let placeDetails = null;
  let error = null;

  try {
    placeDetails = await getBusinessReviews();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
    console.error('Error fetching reviews:', error);
  }

  const reviews = placeDetails?.reviews || [];
  const rating = placeDetails?.rating || 0;
  const totalReviews = placeDetails?.user_ratings_total || reviews.length;

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { stars, count, percentage };
  });

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
              <span className="material-icons text-[#f7941e] text-xl">star</span>
              <span className="text-white font-medium tracking-wide">
                {lang === 'zh' ? '客户评价' : 'Customer Reviews'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-xl">
              {lang === 'zh' ? '真实旅客' : 'Hear From Our'}{' '}
              <span className="text-[#f7941e]">
                {lang === 'zh' ? '评价' : 'Happy Travelers'}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed font-light">
              {lang === 'zh'
                ? '查看真实旅客对我们服务的评价'
                : 'Authentic experiences shared by travelers who explored the world with Qualitour.'}
            </p>

            {/* Stats Cards */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {/* Overall Rating Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/20 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-6 h-6 ${i < Math.round(rating) ? 'text-amber-400' : 'text-white/30'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className="text-4xl font-bold text-white">{rating.toFixed(1)}</div>
                <div className="text-white/70 text-sm">{lang === 'zh' ? '平均评分' : 'Average Rating'}</div>
              </div>

              {/* Total Reviews Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/20 text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-[#f7941e]" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-white">{totalReviews.toLocaleString()}</div>
                <div className="text-white/70 text-sm">{lang === 'zh' ? 'Google 评价' : 'Google Reviews'}</div>
              </div>

              {/* 5-Star Reviews Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/20 text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="material-icons text-3xl text-green-400">verified</span>
                </div>
                <div className="text-4xl font-bold text-white">
                  {reviews.filter(r => r.rating === 5).length}
                </div>
                <div className="text-white/70 text-sm">{lang === 'zh' ? '五星评价' : '5-Star Reviews'}</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Rating Distribution Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
              {/* Left: Overall Rating */}
              <div className="text-center md:text-left flex-shrink-0">
                <div className="text-7xl font-bold text-gray-900">{rating.toFixed(1)}</div>
                <div className="flex items-center justify-center md:justify-start gap-1 my-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-6 h-6 ${i < Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className="text-gray-500">{totalReviews.toLocaleString()} {lang === 'zh' ? '条评价' : 'reviews'}</div>
              </div>

              {/* Right: Rating Bars */}
              <div className="flex-1 w-full space-y-3">
                {ratingDistribution.map(({ stars, count, percentage }) => (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-4">{stars}</span>
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#f7941e] to-[#ff6b35] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Reviews Grid */}
      <section className="py-16 md:py-24 bg-gray-50">
        <Container>
          {error ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="material-icons text-red-500 text-4xl">error_outline</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {lang === 'zh' ? '无法加载评价' : 'Unable to Load Reviews'}
              </h2>
              <p className="text-gray-500">
                {lang === 'zh' ? '请稍后再试' : 'Please try again later'}
              </p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="material-icons text-gray-400 text-4xl">rate_review</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {lang === 'zh' ? '暂无评价' : 'No Reviews Yet'}
              </h2>
              <p className="text-gray-500">
                {lang === 'zh' ? '成为第一个评价的人！' : 'Be the first to leave a review!'}
              </p>
            </div>
          ) : (
            <>
              {/* Section Header */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {lang === 'zh' ? '所有评价' : 'All Reviews'}
                </h2>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                  {lang === 'zh'
                    ? '浏览我们客户的真实体验分享'
                    : 'Browse through authentic experiences shared by our travelers'}
                </p>
              </div>

              {/* Reviews Grid Component */}
              <PremiumReviewsGrid reviews={reviews} lang={lang} />
            </>
          )}
        </Container>
      </section>

      {/* Leave a Review CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#f7941e] to-[#ff6b35] relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#fff_1px,transparent_1px)] [background-size:24px_24px]" />

        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="material-icons text-white text-4xl">edit_note</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              {lang === 'zh' ? '分享您的体验' : 'Share Your Experience'}
            </h2>
            <p className="text-xl text-white/90 mb-10">
              {lang === 'zh'
                ? '您的评价对我们非常重要！帮助其他旅客了解Qualitour的服务。'
                : 'Your feedback means the world to us! Help other travelers discover Qualitour.'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://g.page/r/CdFsZuLNa-xBEBM/review"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#f7941e] px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {lang === 'zh' ? '在 Google 上评价' : 'Leave a Google Review'}
              </a>
              <Link
                href={`${localePrefix}/contact`}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-10 py-4 rounded-full font-bold text-lg border border-white/30 hover:bg-white/30 transition-all"
              >
                <span className="material-icons">mail</span>
                {lang === 'zh' ? '联系我们' : 'Contact Us'}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
