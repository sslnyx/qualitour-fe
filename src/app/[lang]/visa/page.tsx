import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Link from 'next/link';
import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import { getLocalePrefix } from '@/i18n/config';
import { getGoogleReviews } from '@/lib/wordpress/api';
import TransferReviewsCarousel from '@/components/TransferReviewsCarousel';
import { wpUrl } from '@/lib/wp-url';
import VisaInquirySection from '@/components/VisaInquirySection';
import PageHero from '@/components/PageHero';

const VISA_HERO_BG = wpUrl('/wp-content/uploads/2023/08/nuno-alberto-MykFFC5zolE-unsplash1-scaled.jpg');

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const localePrefix = getLocalePrefix(lang);

  const title = lang === 'zh' ? '中国签证服务 | Qualitour' : 'China Visa Services | Qualitour';
  const description =
    lang === 'zh'
      ? 'Qualitour 提供中国签证服务协助：材料清单、表格指导、递交与进度跟进。'
      : 'Hassle-free China visa support: document checklist, application guidance, and submission support.';

  return {
    title,
    description,
    alternates: {
      canonical: `${localePrefix}/visa`,
      languages: {
        en: '/visa',
        zh: '/zh/visa',
      },
    },
  };
}

export default async function VisaPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const localePrefix = getLocalePrefix(lang);

  let reviews = [] as Awaited<ReturnType<typeof getGoogleReviews>>;
  try {
    reviews = await getGoogleReviews();
  } catch {
    reviews = [];
  }

  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

  const isChineseText = (text: string) => /[\u4e00-\u9fff]/.test(text);

  const visaKeywordsEn = [
    'visa',
    'china',
    'chinese visa',
    'application',
    'documents',
    'passport',
    'consulate',
    'submission',
    'processing',
    'form',
  ];

  const visaKeywordsZh = ['签证', '中国', '材料', '护照', '申请', '递交', '表格', '使领馆', '办理', '流程'];

  const keywords = lang === 'zh' ? [...visaKeywordsZh, ...visaKeywordsEn] : visaKeywordsEn;

  const eligible = reviews.filter((r) => (r.rating ?? 0) >= 4 && typeof r.text === 'string' && r.text.trim().length > 0);

  const preferredPool =
    lang === 'zh'
      ? eligible.filter((r) => r.language?.toLowerCase().startsWith('zh') || isChineseText(r.text))
      : eligible;

  const pool = preferredPool.length > 0 ? preferredPool : eligible;

  const countHits = (text: string) => {
    const t = normalizeText(text);
    let hits = 0;
    for (const kw of keywords) {
      const k = normalizeText(kw);
      if (k && t.includes(k)) hits += 1;
    }
    return hits;
  };

  const score = (text: string, rating: number, time: number) => {
    // Main signal is relevance; rating/time are secondary.
    const hits = countHits(text);
    return hits * 200 + rating * 10 + Math.min(text.length, 400) / 20 + (time ?? 0) / 1_000_000_000;
  };

  const matched = pool.filter((r) => countHits(r.text) > 0);
  const selectionPool = matched.length > 0 ? matched : pool;

  const visaReviews = selectionPool
    .map((r) => ({
      review: r,
      s: score(r.text, r.rating ?? 0, r.time ?? 0),
    }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.review)
    .slice(0, 20);

  const title = lang === 'zh' ? '中国签证服务' : 'China Visa Services';
  const subtitle =
    lang === 'zh'
      ? '省时省心，我们协助您完成申请流程'
      : 'Save time with guided, hassle-free support';

  const valueProps =
    lang === 'zh'
      ? [
        {
          icon: 'schedule',
          title: '节省时间',
          body: '不必花大量时间研究材料与表格，我们会协助您按要求准备。',
        },
        {
          icon: 'support_agent',
          title: '经验支持',
          body: '我们熟悉申请流程与常见问题，帮助您更高效地完成递交。',
        },
        {
          icon: 'verified',
          title: '更高成功率',
          body: '通过更清晰的材料准备与提交检查，降低遗漏风险。',
        },
      ]
      : [
        {
          icon: 'schedule',
          title: 'Save your time',
          body: 'Skip the research and focus on your trip. We’ll guide your application step-by-step.',
        },
        {
          icon: 'support_agent',
          title: 'Leverage our experience',
          body: 'We know the typical requirements and common pitfalls, helping you prepare correctly.',
        },
        {
          icon: 'verified',
          title: 'Increase success rate',
          body: 'A clear checklist and review process reduces errors and missing documents.',
        },
      ];

  const steps =
    lang === 'zh'
      ? [
        { title: '咨询与签证类型确认', body: '根据出行目的与行程，确认合适的签证类型与时间安排。' },
        { title: '材料清单与表格指导', body: '提供材料清单并协助填写表格，确保信息一致。' },
        { title: '递交与进度跟进', body: '协助递交申请并跟进进度，及时提醒补充材料。' },
        { title: '取证与交付', body: '完成后通知取证/寄送安排。' },
      ]
      : [
        { title: 'Consultation', body: 'Confirm your visa type and timeline based on your trip purpose.' },
        { title: 'Document checklist', body: 'We provide a checklist and guidance on forms and required documents.' },
        { title: 'Submission support', body: 'We support the submission process and follow up on progress.' },
        { title: 'Pickup / delivery', body: 'Once ready, we coordinate pickup or delivery options.' },
      ];

  const requirements =
    lang === 'zh'
      ? ['有效护照', '签证照片', '出行行程/机票与住宿信息（如适用）', '工作/财务等辅助材料（视情况）']
      : ['Valid passport', 'Visa photo', 'Itinerary / flight and accommodation details (if applicable)', 'Supporting documents (may vary by case)'];

  return (
    <main className="grow">
      {/* Hero Section */}
      <PageHero
        image={VISA_HERO_BG}
        title={
          <>
            {lang === 'zh' ? '中国' : 'China'}{' '}
            <span className="text-[#f7941e]">{lang === 'zh' ? '签证服务' : 'Visa Services'}</span>
          </>
        }
        subtitle={subtitle}
        badge={{ icon: 'assignment', text: lang === 'zh' ? '签证服务' : 'Visa Services' }}
      />

      {/* Value Props Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valueProps.map((p, idx) => (
              <div
                key={p.title}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-[#f7941e]/20 hover:-translate-y-1"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Icon Container */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f7941e] to-[#ff6b35] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="material-icons text-white text-3xl">{p.icon}</span>
                  </div>

                  {/* Content */}
                  <h2 className="text-xl font-bold text-text-heading mb-4">{p.title}</h2>
                  <p className="text-text leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How it Works Section */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Steps */}
            <div>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 bg-[#f7941e]/10 rounded-full px-4 py-2 mb-4">
                  <span className="material-icons text-[#f7941e] text-sm">route</span>
                  <span className="text-[#f7941e] font-semibold text-sm tracking-wide uppercase">
                    {lang === 'zh' ? '流程' : 'Process'}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-text-heading">
                  {lang === 'zh' ? '我们如何协助' : 'How it works'}
                </h2>
              </div>

              <div className="space-y-6">
                {steps.map((s, idx) => (
                  <div
                    key={s.title}
                    className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#f7941e]/20"
                  >
                    <div className="flex items-start gap-5">
                      {/* Step Number */}
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#f7941e] to-[#ff6b35] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-lg">{idx + 1}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-text-heading mb-2">{s.title}</h3>
                        <p className="text-text-muted leading-relaxed">{s.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Requirements */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 md:p-10 border border-gray-200 shadow-lg">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 bg-[#f7941e]/10 rounded-full px-4 py-2 mb-4">
                    <span className="material-icons text-[#f7941e] text-sm">checklist</span>
                    <span className="text-[#f7941e] font-semibold text-sm tracking-wide uppercase">
                      {lang === 'zh' ? '材料' : 'Requirements'}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-text-heading mb-3">
                    {lang === 'zh' ? '常见材料' : 'Typical requirements'}
                  </h2>
                  <p className="text-text-muted leading-relaxed">
                    {lang === 'zh'
                      ? '具体材料可能因签证类型与个人情况不同，请以我们最终确认的清单为准。'
                      : "Requirements may vary by visa type and personal situation. We'll confirm the final checklist with you."}
                  </p>
                </div>

                <ul className="space-y-4">
                  {requirements.map((r) => (
                    <li key={r} className="flex items-start gap-4">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-[#f7941e]/10 flex items-center justify-center mt-0.5">
                        <span className="material-icons text-[#f7941e] text-lg">check_circle</span>
                      </div>
                      <span className="text-gray-700 leading-relaxed pt-1">{r}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-3">
                    <span className="material-icons text-blue-600 text-xl mt-0.5">info</span>
                    <p className="text-sm text-blue-900 leading-relaxed">
                      {lang === 'zh'
                        ? '提示：签证政策可能调整，建议尽早规划并预留办理时间。'
                        : 'Note: Visa policies can change. Plan ahead and allow sufficient processing time.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Visa Inquiry Form Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Container>
          <VisaInquirySection lang={lang} />
        </Container>
      </section>

      {visaReviews.length > 0 ? (
        <section className="py-16 md:py-24 bg-white">
          <Container>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 bg-[#f7941e]/10 rounded-full px-4 py-2 mb-3">
                    <span className="material-icons text-[#f7941e] text-sm">star</span>
                    <span className="text-[#f7941e] font-semibold text-sm tracking-wide uppercase">
                      {lang === 'zh' ? '评价' : 'Reviews'}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-text-heading mb-2">
                    {lang === 'zh' ? '客户评价' : 'Customer Reviews'}
                  </h2>
                  <p className="text-text-muted">
                    {lang === 'zh' ? '来自 Google 的真实评价' : 'Real reviews from Google'}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <TransferReviewsCarousel reviews={visaReviews} lang={lang} />
              </div>

              <div className="text-center">
                <Link
                  href={`${localePrefix}/reviews`}
                  className="inline-flex items-center gap-2 text-[#f7941e] hover:text-[#e68a1c] font-semibold transition-colors group"
                >
                  <span>{lang === 'zh' ? '查看所有评价' : 'Read more reviews'}</span>
                  <span className="material-icons text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#f7941e] to-[#ff6b35] relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#fff_1px,transparent_1px)] [background-size:24px_24px]" />

        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="material-icons text-white text-4xl">flight_takeoff</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              {lang === 'zh' ? '准备前往中国？' : 'China bound?'}
            </h2>

            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              {lang === 'zh'
                ? '告诉我们您的出行计划，我们会协助您理清材料并推进申请。'
                : "Tell us your travel plan and we'll help you move the application forward with clarity and care."}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={`${localePrefix}/contact`}
                className="inline-flex items-center gap-2 bg-white text-[#f7941e] px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <span className="material-icons">mail</span>
                {lang === 'zh' ? '立即咨询' : 'Talk to us'}
              </Link>
              <a
                href="tel:+17789456000"
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-10 py-4 rounded-full font-bold text-lg border border-white/30 hover:bg-white/30 transition-all"
              >
                <span className="material-icons">phone</span>
                (778) 945-6000
              </a>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

