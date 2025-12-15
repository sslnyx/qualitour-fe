import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { getLocalePrefix } from '@/i18n/config';
import { getGoogleReviews } from '@/lib/wordpress/api';
import TransferReviewsCarousel from '@/components/TransferReviewsCarousel';
import { wpUrl } from '@/lib/wp-url';

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
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: `url(${VISA_HERO_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <Container>
          <div className="relative py-16 md:py-24">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{title}</h1>
            <p className="text-lg md:text-2xl text-white/90 max-w-3xl">{subtitle}</p>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20 bg-gray-50">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valueProps.map((p) => (
              <div key={p.title} className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-icons text-[#f7941e]">{p.icon}</span>
                  <h2 className="text-xl font-bold text-text-heading">{p.title}</h2>
                </div>
                <p className="text-text">{p.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-text-heading mb-6">
                {lang === 'zh' ? '我们如何协助' : 'How it works'}
              </h2>
              <div className="space-y-4">
                {steps.map((s, idx) => (
                  <div key={s.title} className="flex items-start gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#f7941e] font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-text-heading">{s.title}</div>
                      <div className="text-text-muted">{s.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
              <h2 className="text-3xl font-bold text-text-heading mb-4">
                {lang === 'zh' ? '常见材料' : 'Typical requirements'}
              </h2>
              <p className="text-text-muted mb-6">
                {lang === 'zh'
                  ? '具体材料可能因签证类型与个人情况不同，请以我们最终确认的清单为准。'
                  : 'Requirements may vary by visa type and personal situation. We’ll confirm the final checklist with you.'}
              </p>

              <ul className="space-y-3">
                {requirements.map((r) => (
                  <li key={r} className="flex items-start gap-3">
                    <i className="fa fa-check-circle text-[#f7941e] mt-1" aria-hidden="true" />
                    <span className="text-gray-700">{r}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  href={`${localePrefix}/contact`}
                  className="inline-block w-full text-center px-6 py-3 bg-[#f7941e] hover:bg-[#e68a1c] text-white font-semibold rounded-md transition-colors"
                >
                  {lang === 'zh' ? '联系并开始申请' : 'Contact us to get started'}
                </Link>
              </div>

              <p className="text-xs text-text-muted mt-4">
                {lang === 'zh'
                  ? '提示：签证政策可能调整，建议尽早规划并预留办理时间。'
                  : 'Note: Visa policies can change. Plan ahead and allow sufficient processing time.'}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {visaReviews.length > 0 ? (
        <section className="py-16 md:py-24 bg-gray-50">
          <Container>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-text-heading mb-2">
                    {lang === 'zh' ? '客户评价' : 'Customer Reviews'}
                  </h2>
                  <p className="text-text-muted">
                    {lang === 'zh' ? '来自 Google 的真实评价' : 'Real reviews from Google'}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <TransferReviewsCarousel reviews={visaReviews} lang={lang} />
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
          </Container>
        </section>
      ) : null}

      <section className="py-16 md:py-24 bg-[#f7941e]">
        <Container>
          <div className="text-center text-white max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {lang === 'zh' ? '准备前往中国？' : 'China bound?'}
            </h2>
            <p className="text-lg mb-8 opacity-90">
              {lang === 'zh'
                ? '告诉我们您的出行计划，我们会协助您理清材料并推进申请。'
                : 'Tell us your travel plan and we’ll help you move the application forward with clarity and care.'}
            </p>
            <Link
              href={`${localePrefix}/contact`}
              className="inline-block px-8 py-3 bg-white text-[#f7941e] font-bold rounded-md hover:bg-gray-100 transition-colors"
            >
              {lang === 'zh' ? '立即咨询' : 'Talk to us'}
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
