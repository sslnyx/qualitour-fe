import Link from 'next/link';
import { getLocalePrefix, type Locale } from '@/i18n/config';
import { getGoogleReviews } from '@/lib/wordpress/api';
import type { GoogleReview } from '@/lib/wordpress/types';
import TransferReviewsCarousel from '@/components/TransferReviewsCarousel';

type Props = {
  lang: Locale;
  title?: string;
  count?: number;
  mode?: 'top' | 'all';
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function isChineseText(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

function scoreReviewForKeywords(review: GoogleReview, keywords: string[]): number {
  const text = normalizeText(review.text || '');
  if (!text) return -Infinity;

  let score = 0;

  // Prioritize higher ratings.
  score += review.rating * 20;

  // Prefer more descriptive reviews.
  score += Math.min(review.text.length, 400) / 10;

  // Keyword boosts.
  for (const keyword of keywords) {
    const k = normalizeText(keyword);
    if (!k) continue;
    if (text.includes(k)) score += 60;
  }

  return score;
}

function countKeywordHits(text: string, keywords: string[]): number {
  const normalized = normalizeText(text || '');
  if (!normalized) return 0;

  let hits = 0;
  for (const keyword of keywords) {
    const k = normalizeText(keyword);
    if (!k) continue;
    if (normalized.includes(k)) hits += 1;
  }
  return hits;
}

function pickFeaturedTransferReview(reviews: GoogleReview[], lang: Locale): GoogleReview | null {
  const enKeywords = [
    'private transfer',
    'transfer',
    'airport',
    'yvr',
    'cruise',
    'terminal',
    'whistler',
    'shuttle',
    'driver',
    'on time',
    'punctual',
    'van',
  ];

  const zhKeywords = ['接送', '包车', '机场', '温哥华', '惠斯勒', '司机', '准时', '码头', '邮轮'];

  const keywords = lang === 'zh' ? [...zhKeywords, ...enKeywords] : enKeywords;

  const eligible = reviews.filter((r) => (r.rating ?? 0) >= 4 && typeof r.text === 'string' && r.text.trim().length > 0);
  if (eligible.length === 0) return null;

  // If we're rendering ZH, bias toward Chinese reviews when available.
  const languagePreferred =
    lang === 'zh'
      ? eligible.filter((r) => r.language?.toLowerCase().startsWith('zh') || isChineseText(r.text))
      : eligible;

  const pool = languagePreferred.length > 0 ? languagePreferred : eligible;

  let best: GoogleReview | null = null;
  let bestScore = -Infinity;

  for (const review of pool) {
    const score = scoreReviewForKeywords(review, keywords);
    if (score > bestScore) {
      bestScore = score;
      best = review;
    }
  }

  return best;
}

function pickTopTransferReviews(reviews: GoogleReview[], lang: Locale, count: number): GoogleReview[] {
  const enKeywords = [
    'private transfer',
    'transfer',
    'airport',
    'yvr',
    'cruise',
    'terminal',
    'whistler',
    'shuttle',
    'driver',
    'on time',
    'punctual',
    'van',
  ];

  const zhKeywords = ['接送', '包车', '机场', '温哥华', '惠斯勒', '司机', '准时', '码头', '邮轮'];

  const keywords = lang === 'zh' ? [...zhKeywords, ...enKeywords] : enKeywords;

  const eligible = reviews
    .filter((r) => (r.rating ?? 0) >= 4 && typeof r.text === 'string' && r.text.trim().length > 0)
    .filter((r) => {
      // If we're rendering ZH, bias toward Chinese reviews but don't hard-exclude English.
      if (lang !== 'zh') return true;
      return true;
    });

  const preferredPool =
    lang === 'zh'
      ? eligible.filter((r) => r.language?.toLowerCase().startsWith('zh') || isChineseText(r.text))
      : eligible;

  const pool = preferredPool.length > 0 ? preferredPool : eligible;

  const scored = pool
    .map((review) => ({
      review,
      score: scoreReviewForKeywords(review, keywords),
    }))
    .filter((x) => Number.isFinite(x.score))
    .sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const result: GoogleReview[] = [];

  for (const item of scored) {
    const key = `${item.review.author_name}|${item.review.time}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item.review);
    if (result.length >= count) break;
  }

  return result;
}

function pickAllMatchedTransferReviews(reviews: GoogleReview[], lang: Locale): GoogleReview[] {
  const enKeywords = [
    'private transfer',
    'transfer',
    'airport',
    'yvr',
    'cruise',
    'terminal',
    'whistler',
    'shuttle',
    'driver',
    'on time',
    'punctual',
    'van',
  ];

  const zhKeywords = ['接送', '包车', '机场', '温哥华', '惠斯勒', '司机', '准时', '码头', '邮轮'];
  const keywords = lang === 'zh' ? [...zhKeywords, ...enKeywords] : enKeywords;

  const eligible = reviews.filter((r) => (r.rating ?? 0) >= 4 && typeof r.text === 'string' && r.text.trim().length > 0);
  if (eligible.length === 0) return [];

  const byLanguage =
    lang === 'zh'
      ? eligible.filter((r) => r.language?.toLowerCase().startsWith('zh') || isChineseText(r.text))
      : eligible;

  const pool = byLanguage.length > 0 ? byLanguage : eligible;

  const matched = pool.filter((r) => countKeywordHits(r.text, keywords) > 0);
  const finalPool = matched.length > 0 ? matched : pool;

  return finalPool
    .map((review) => {
      const hits = countKeywordHits(review.text, keywords);
      return {
        review,
        score: scoreReviewForKeywords(review, keywords) + hits * 60,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.review);
}

export default async function FeaturedGoogleReview({ lang, title, count = 1, mode = 'top' }: Props) {
  const localePrefix = getLocalePrefix(lang);
  const safeCount = Math.max(1, Math.min(6, count));

  let reviews: GoogleReview[] = [];
  try {
    reviews = await getGoogleReviews();
  } catch {
    reviews = [];
  }

  const matchedReviews = mode === 'all' ? pickAllMatchedTransferReviews(reviews, lang) : pickTopTransferReviews(reviews, lang, safeCount);
  const featured = matchedReviews[0] ?? pickFeaturedTransferReview(reviews, lang);

  if (!featured) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-text-heading mb-4">{title ?? (lang === 'zh' ? '客户评价' : 'Customer Review')}</h3>
        <p className="text-text-muted">{lang === 'zh' ? '暂无可显示的评价。' : 'No reviews available right now.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold text-text-heading mb-2">{title ?? (lang === 'zh' ? '客户评价' : 'Customer Review')}</h3>
          {/* <div className="flex items-center gap-3 text-sm text-text-muted">
            <span>
              {lang === 'zh'
                ? `已匹配 ${Math.max(1, matchedReviews.length)} 条与接送相关的评价`
                : `Matched ${Math.max(1, matchedReviews.length)} transfer-related reviews`}
            </span>
          </div> */}
        </div>
      </div>

      <div className="mt-6">
        <TransferReviewsCarousel reviews={matchedReviews.length > 0 ? matchedReviews : [featured]} lang={lang} />
      </div>

      <div className="mt-4">
        <Link
          href={`${localePrefix}/reviews`}
          className="text-sm font-semibold text-[#f7941e] hover:text-[#e68a1c]"
        >
          {lang === 'zh' ? '查看所有评价' : 'Read more reviews'}
        </Link>
      </div>
    </div>
  );
}
