import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { getLocalePrefix } from '@/i18n/config';
import TransferBookingModalButton from '@/components/TransferBookingModalButton';
import FeaturedGoogleReview from '@/components/FeaturedGoogleReview';

type TransferOffer = {
  titleLines: string[];
  caption: string;
  book: Array<{ href: string; label: string }>;
};

type TransferSection = {
  id: string;
  heading: string;
  caption: string;
  offers: TransferOffer[];
};

type FleetItem = {
  imageUrl: string;
  label: string;
};

type CharterRate = {
  imageUrl: string;
  title: string;
  priceNumber: string;
  priceUnit: string;
  bullets: string[];
};

const FLEET_ITEMS: FleetItem[] = [
  {
    imageUrl: 'http://qualitour.local/wp-content/uploads/2020/12/2-Sienna-300x207.png',
    label: 'Mini-van (4-seater)',
  },
  {
    imageUrl: 'http://qualitour.local/wp-content/uploads/2020/10/transfer-standard-van-1-300x200.jpg',
    label: 'Standard Van (11-seater)',
  },
  {
    imageUrl: 'http://qualitour.local/wp-content/uploads/2020/10/transfer-deluxe-van-1-300x200.jpg',
    label: 'Deluxe Van (14-seater)',
  },
];

const TRANSFER_SECTIONS: TransferSection[] = [
  {
    id: 'private-transfers',
    heading: 'Private Transfers',
    caption: 'Choose a route below',
    offers: [
      {
        titleLines: ['Vancouver Airport (YVR)', 'to', 'Whistler'],
        caption: 'From $465 (per vehicle)',
        book: [
          { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/18?', label: 'Book Now (11-seater)' },
          { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/54?', label: 'Book Now (14-seater)' },
        ],
      },
      {
        titleLines: ['Greater Vancouver', 'to', 'Whistler'],
        caption: 'From $435 (per vehicle)',
        book: [
          { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/16?', label: 'Book Now (11-seater)' },
          { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/53?', label: 'Book Now (14-seater)' },
        ],
      },
      {
        titleLines: ['Whistler', 'to', 'YVR Airport / Greater Vancouver'],
        caption: 'From $435 (per vehicle)',
        book: [
          { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/20?', label: 'Book Now (11-seater)' },
          { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/55?', label: 'Book Now (14-seater)' },
        ],
      },
      {
        titleLines: ['YVR Airport / Greater Vancouver', 'to', 'Sun Peaks'],
        caption: 'From $960 (per vehicle)',
        book: [{ href: 'https://qualitour.zaui.net/booking/web/#/default/activity/82?', label: 'Book Now (11-seater)' }],
      },
      {
        titleLines: ['Sun Peaks', 'to', 'YVR Airport / Greater Vancouver'],
        caption: 'From $960 (per vehicle)',
        book: [{ href: 'https://qualitour.zaui.net/booking/web/#/default/activity/83?', label: 'Book Now (11-seater)' }],
      },
      {
        titleLines: ['Vancouver', 'to', 'Seattle'],
        caption: 'From $950 (per vehicle)',
        book: [
          { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/84?', label: 'Book Now (11-seater)' },
          { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/97?', label: 'Book Now (14-seater)' },
        ],
      },
      {
        titleLines: ['Seattle', 'to', 'Vancouver'],
        caption: 'From $1050 (per vehicle)',
        book: [
          { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/85?', label: 'Book Now (11-seater)' },
          { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/98?', label: 'Book Now (14-seater)' },
        ],
      },
      {
        titleLines: ['Vancouver Airport (YVR)', 'to', 'Canada Place Cruise Terminal'],
        caption: 'From $245 (per vehicle)',
        book: [
          { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/88?', label: 'Book Now (11-seater)' },
          { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/96?', label: 'Book Now (14-seater)' },
        ],
      },
      {
        titleLines: ['Canada Place Cruise Terminal', 'to', 'Vancouver Airport (YVR)'],
        caption: 'From $240 (per vehicle)',
        book: [
          { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/89?', label: 'Book Now (11-seater)' },
          { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/95?', label: 'Book Now (14-seater)' },
        ],
      },
    ],
  },
];

const CHARTER_RATES: CharterRate[] = [
  {
    imageUrl: 'http://qualitour.local/wp-content/uploads/2020/12/2-Van.png',
    title: 'Mercedes Sprinter Van (Standard)',
    priceNumber: '95',
    priceUnit: '/ Hr',
    bullets: ['Up to 11 passengers with luggage', 'Min. 2.5 hours', 'Within Greater Vancouver only'],
  },
  {
    imageUrl: 'http://qualitour.local/wp-content/uploads/2020/12/3-Deluxe-Van.png',
    title: 'Mercedes Sprinter Van (Deluxe)',
    priceNumber: '110',
    priceUnit: '/ Hr',
    bullets: ['Up to 14 passengers with luggage', 'Min. 2.5 hours', 'Within Greater Vancouver only'],
  },
  {
    imageUrl: 'http://qualitour.local/wp-content/uploads/2024/10/Weixin-Image_20240924131059.jpg',
    title: 'Mercedes Sprinter Van (Deluxe)',
    priceNumber: '110',
    priceUnit: '/ Hr',
    bullets: ['Up to 14 passengers with luggage', 'Min. 2.5 hours', 'Within Greater Vancouver only'],
  },
];

function extractPriceNumber(caption: string): string | null {
  const m = caption.match(/\$\s*(\d+)/);
  return m ? m[1] : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const localePrefix = getLocalePrefix(lang);

  const title = lang === 'zh' ? '私人接送 | Qualitour' : 'Private Transfers | Qualitour';
  const description =
    lang === 'zh'
      ? 'Qualitour 提供大温哥华及周边地区私人接送服务：机场接送、邮轮码头接送、滑雪度假村接送等。'
      : 'Private transfer services across Greater Vancouver and the Lower Mainland: airport transfers, cruise ship transfers, and ski resort transfers.';

  return {
    title,
    description,
    alternates: {
      canonical: `${localePrefix}/private-transfers`,
      languages: {
        en: '/private-transfers',
        zh: '/zh/private-transfers',
      },
    },
  };
}

export default async function PrivateTransfersPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const localePrefix = getLocalePrefix(lang);

  const heading = lang === 'zh' ? '私人接送' : 'Private Transfers';
  const subheading =
    lang === 'zh'
      ? '舒适、安全、准时的专属用车服务'
      : 'Proudly serving throughout Greater Vancouver and the Lower Mainland';

  const highlights =
    lang === 'zh'
      ? [
          '覆盖大温哥华及周边地区',
          '机场 / 邮轮码头 / 滑雪度假村接送',
          '适合家庭与小团体出行',
          '可按行程定制（接送/包车）',
        ]
      : [
          'Serving Greater Vancouver and the Lower Mainland',
          'Airport, cruise terminal, and ski resort transfers',
          'Ideal for families and small private groups',
          'Custom quotes for transfers and charter services',
        ];

  return (
    <main className="grow">
      <section className="bg-gray-50 py-12 md:py-16">
        <Container>
          <h1 className="text-4xl md:text-5xl font-bold text-text-heading mb-4">{heading}</h1>
          <p className="text-text-muted text-lg">{subheading}</p>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-text-heading mb-6">
                {lang === 'zh' ? '专属接送，让出行更轻松' : 'Be transferred in style!'}
              </h2>
              <p className="text-text text-lg mb-6">
                {lang === 'zh'
                  ? '我们提供大温哥华及周边地区的私人接送与包车服务。无论是机场接送、邮轮码头接送，还是前往滑雪度假村，我们都能根据您的行程安排合适车型与出发时间。'
                  : 'We provide private transfers and charter services across Greater Vancouver and the Lower Mainland. From airport pickups to cruise terminal transfers and ski resort rides, we’ll tailor timing and vehicle options to your trip.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-10">
                {highlights.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <i className="fa fa-check-circle text-[#f7941e] mt-1" aria-hidden="true" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mb-10">
                <FeaturedGoogleReview lang={lang} title={lang === 'zh' ? '客户评价' : 'Customer Review'} mode="all" />
              </div>

              <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-text-heading mb-3">{lang === 'zh' ? '我们的车型' : 'Our Fleet'}</h3>
                <p className="text-text-muted mb-8">
                  {lang === 'zh'
                    ? '我们专注于小团体私人接送，可容纳最多 14 人。'
                    : 'We specialize in small group private transfers which may accommodate up to 14 people.'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {FLEET_ITEMS.map((item) => (
                    <div key={item.label} className="bg-white rounded-lg overflow-hidden border border-gray-200">
                      <div className="bg-white p-4">
                        <img src={item.imageUrl} alt={item.label} className="w-full h-auto" />
                      </div>
                      <div className="px-4 pb-4 text-center text-text-muted">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-text-heading mb-3">
                {lang === 'zh' ? '需要报价？' : 'Need a quote?'}
              </h3>
              <p className="text-text mb-6">
                {lang === 'zh'
                  ? '告诉我们出行日期、人数、上下车地点与大致时间，我们会尽快回复报价与安排建议。'
                  : 'Share your date, group size, pickup/drop-off locations, and preferred time. We’ll get back to you with a quote and recommendations.'}
              </p>

              <div className="space-y-3 text-sm text-text">
                <div className="flex items-start gap-3">
                  <span className="material-icons text-[#f7941e]">call</span>
                  <div>
                    <div className="font-semibold">{lang === 'zh' ? '电话' : 'Phone'}</div>
                    <a className="text-text hover:text-[#f7941e] transition-colors" href="tel:+17789456000">
                      +1 (778) 945-6000
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-icons text-[#f7941e]">mail</span>
                  <div>
                    <div className="font-semibold">{lang === 'zh' ? '邮箱' : 'Email'}</div>
                    <a className="text-text hover:text-[#f7941e] transition-colors break-all" href="mailto:info@qualitour.ca">
                      info@qualitour.ca
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href={`${localePrefix}/contact`}
                  className="inline-block w-full text-center px-6 py-3 bg-[#f7941e] hover:bg-[#e68a1c] text-white font-semibold rounded-md transition-colors"
                >
                  {lang === 'zh' ? '联系并获取报价' : 'Contact us for a quote'}
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* In-page Tabs */}
      <section className="border-t border-b border-gray-200 bg-white">
        <Container>
          <nav aria-label="Services" className="flex items-center gap-6 py-4 overflow-x-auto">
            <a
              href="#private-transfers"
              className="whitespace-nowrap font-semibold text-[#f7941e] hover:text-[#e68a1c]"
            >
              {lang === 'zh' ? '私人接送' : 'Private Transfers'}
            </a>
            <a
              href="#charter"
              className="whitespace-nowrap font-semibold text-gray-700 hover:text-[#f7941e]"
            >
              {lang === 'zh' ? '包车服务' : 'Charter Services'}
            </a>
          </nav>
        </Container>
      </section>

      {/* Private Transfers (Legacy-style rates + booking links) */}
      <section id="private-transfers" className="py-16 md:py-24">
        <Container>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-text-heading mb-2">
              {lang === 'zh' ? '私人接送' : 'Private Transfers'}
            </h2>
            <p className="text-text-muted mb-10">
              {lang === 'zh'
                ? '以下价格与预订链接与旧站一致。'
                : 'Rates and booking links below match the legacy site.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {TRANSFER_SECTIONS[0].offers.map((offer) => {
                const price = extractPriceNumber(offer.caption);
                return (
                  <div key={offer.titleLines.join('|')} className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow flex flex-col">
                    <h3 className="text-text-heading mb-4" style={{ fontSize: '20px', fontWeight: 500, textTransform: 'none', lineHeight: '1.6' }}>
                      {offer.titleLines.map((line, idx) => (
                        <span key={line + idx}>
                          {line}
                          {idx < offer.titleLines.length - 1 ? <br /> : null}
                        </span>
                      ))}
                    </h3>

                    <div className="mb-6">
                      {price ? (
                        <>
                          <div className="text-[#f7941e] font-bold" style={{ fontSize: '48px' }}>{`$${price}`}</div>
                          <div className="text-gray-500 text-sm">per vehicle</div>
                        </>
                      ) : (
                        <div className="text-gray-700">{offer.caption}</div>
                      )}
                    </div>
                    <div className='flex-1'></div>

                    <div className="space-y-3">
                      {offer.book.map((b) => {
                        const activityMatch = b.href.match(/activity\/(\d+)\?/);
                        const activityId = activityMatch?.[1];

                        if (activityId) {
                          return (
                            <TransferBookingModalButton
                              key={b.href}
                              label={b.label}
                              activityId={activityId}
                              localePrefix={localePrefix}
                            />
                          );
                        }

                        return (
                          <a
                            key={b.href}
                            href={b.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full px-4 py-2 rounded-md bg-[#f7941e] hover:bg-[#e68a1c] text-white font-semibold transition-colors"
                          >
                            {b.label}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Charter Services (Legacy-style hourly rates) */}
      <section id="charter" className="py-16 md:py-24 bg-gray-50">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-heading mb-4">
                {lang === 'zh' ? '包车服务' : 'Charter Services'}
              </h2>
              <p className="text-text-muted text-lg max-w-3xl mx-auto">
                {lang === 'zh'
                  ? '无论您需要观光包车、接送、短驳或私人行程，我们都可以提供合适车辆与报价。'
                  : 'Whether you are looking for a sightseeing tour, transfers, shuttle services, or private tours, Qualitour has the perfect vehicle for you.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {CHARTER_RATES.map((rate, idx) => (
                <div key={rate.imageUrl + idx} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="bg-white p-6">
                    <img src={rate.imageUrl} alt={rate.title} className="w-full h-auto" />
                  </div>
                  <div className="px-6 pb-6">
                    <h3 className="text-xl font-bold text-text-heading">{rate.title}</h3>
                    <div className="text-gray-500 text-sm mt-1">{lang === 'zh' ? '小时费率' : 'Hourly rate'}</div>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-gray-700 font-semibold">$</span>
                      <span className="text-4xl font-bold text-text-heading">{rate.priceNumber}</span>
                      <span className="text-gray-500">{rate.priceUnit}</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-gray-700">
                      {rate.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3">
                          <i className="fa fa-check text-[#f7941e] mt-1" aria-hidden="true" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-14 bg-white border border-gray-200 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-text-heading mb-3">{lang === 'zh' ? '需要定制报价？' : 'Need customized quote?'}</h3>
              <p className="text-text-muted mb-6">
                {lang === 'zh'
                  ? '留下您的需求与行程信息，我们会尽快回复。'
                  : 'Leave us a message and we will get back to you ASAP.'}
              </p>
              <Link
                href={`${localePrefix}/contact`}
                className="inline-block px-8 py-3 bg-[#f7941e] hover:bg-[#e68a1c] text-white font-semibold rounded-md transition-colors"
              >
                {lang === 'zh' ? '联系并获取报价' : 'Contact us'}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-[#f7941e]">
        <Container>
          <div className="text-center text-white max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {lang === 'zh' ? '准备出发了吗？' : 'Ready to book your transfer?'}
            </h2>
            <p className="text-lg mb-8 opacity-90">
              {lang === 'zh'
                ? '让我们为您的旅程提供顺畅的接送安排。'
                : 'Let us handle the logistics so you can focus on the trip.'}
            </p>
            <Link
              href={`${localePrefix}/contact`}
              className="inline-block px-8 py-3 bg-white text-[#f7941e] font-bold rounded-md hover:bg-gray-100 transition-colors"
            >
              {lang === 'zh' ? '立即咨询' : 'Get in touch'}
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
