import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Link from 'next/link';
import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import { getLocalePrefix } from '@/i18n/config';
import TransferBookingModalButton from '@/components/TransferBookingModalButton';
import FeaturedGoogleReview from '@/components/FeaturedGoogleReview';
import { wpUrl } from '@/lib/wp-url';
import PageHero from '@/components/PageHero';

type TransferOffer = {
  titleLines: string[];
  caption: string;
  book: Array<{ href: string; label: string }>;
  icon?: string;
};

type FleetItem = {
  imageUrl: string;
  label: string;
  capacity: string;
  features: string[];
};

type CharterRate = {
  imageUrl: string;
  title: string;
  priceNumber: string;
  priceUnit: string;
  bullets: string[];
  popular?: boolean;
};

const FLEET_ITEMS: FleetItem[] = [
  {
    imageUrl: wpUrl('/wp-content/uploads/2020/12/2-Sienna-300x207.png'),
    label: 'Mini-van',
    capacity: '4 passengers',
    features: ['Comfortable seating', 'Air conditioning', 'Luggage space'],
  },
  {
    imageUrl: wpUrl('/wp-content/uploads/2020/10/transfer-standard-van-1-300x200.jpg'),
    label: 'Standard Van',
    capacity: '11 passengers',
    features: ['Spacious interior', 'Premium comfort', 'Extra luggage room'],
  },
  {
    imageUrl: wpUrl('/wp-content/uploads/2020/10/transfer-deluxe-van-1-300x200.jpg'),
    label: 'Deluxe Van',
    capacity: '14 passengers',
    features: ['Luxury seating', 'Entertainment system', 'Maximum comfort'],
  },
];

const TRANSFER_OFFERS: TransferOffer[] = [
  {
    titleLines: ['Vancouver Airport (YVR)', '→', 'Whistler'],
    caption: 'From $465',
    icon: 'flight_land',
    book: [
      { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/19?', label: '11-seater' },
      { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/54?', label: '14-seater' },
    ],
  },
  {
    titleLines: ['Greater Vancouver', '→', 'Whistler'],
    caption: 'From $435',
    icon: 'downhill_skiing',
    book: [
      { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/19?', label: '11-seater' },
      { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/54?', label: '14-seater' },
    ],
  },
  {
    titleLines: ['Whistler', '→', 'YVR / Vancouver'],
    caption: 'From $435',
    icon: 'flight_takeoff',
    book: [
      { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/20?', label: '11-seater' },
      { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/55?', label: '14-seater' },
    ],
  },
  {
    titleLines: ['Vancouver', '→', 'Sun Peaks'],
    caption: 'From $960',
    icon: 'ac_unit',
    book: [{ href: 'https://qualitour.zaui.net/booking/web/#/default/activity/82?', label: '11-seater' }],
  },
  {
    titleLines: ['Sun Peaks', '→', 'Vancouver'],
    caption: 'From $960',
    icon: 'ac_unit',
    book: [{ href: 'https://qualitour.zaui.net/booking/web/#/default/activity/83?', label: '11-seater' }],
  },
  {
    titleLines: ['Vancouver', '→', 'Seattle'],
    caption: 'From $950',
    icon: 'directions_car',
    book: [
      { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/84?', label: '11-seater' },
      { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/97?', label: '14-seater' },
    ],
  },
  {
    titleLines: ['Seattle', '→', 'Vancouver'],
    caption: 'From $1050',
    icon: 'directions_car',
    book: [
      { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/85?', label: '11-seater' },
      { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/98?', label: '14-seater' },
    ],
  },
  {
    titleLines: ['YVR Airport', '→', 'Canada Place Cruise'],
    caption: 'From $245',
    icon: 'directions_boat',
    book: [
      { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/88?', label: '11-seater' },
      { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/96?', label: '14-seater' },
    ],
  },
  {
    titleLines: ['Canada Place Cruise', '→', 'YVR Airport'],
    caption: 'From $240',
    icon: 'directions_boat',
    book: [
      { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/89?', label: '11-seater' },
      { href: 'https://qualitour.zaui.net/booking/web/#/default/activity/95?', label: '14-seater' },
    ],
  },
];

const CHARTER_RATES: CharterRate[] = [
  {
    imageUrl: wpUrl('/wp-content/uploads/2020/12/2-Van.png'),
    title: 'Mercedes Sprinter Van (Standard)',
    priceNumber: '95',
    priceUnit: '/ Hr',
    bullets: ['Up to 11 passengers with luggage', 'Min. 2.5 hours', 'Within Greater Vancouver only'],
  },
  {
    imageUrl: wpUrl('/wp-content/uploads/2020/12/3-Deluxe-Van.png'),
    title: 'Mercedes Sprinter Van (Deluxe)',
    priceNumber: '110',
    priceUnit: '/ Hr',
    bullets: ['Up to 14 passengers with luggage', 'Min. 2.5 hours', 'Within Greater Vancouver only'],
    popular: true,
  },
  {
    imageUrl: wpUrl('/wp-content/uploads/2024/10/Weixin-Image_20240924131059.jpg'),
    title: 'Premium Charter Package',
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

  const t = {
    heading: lang === 'zh' ? '私人接送服务' : 'Private Transfer Services',
    subheading: lang === 'zh'
      ? '舒适、安全、准时的专属用车服务'
      : 'Premium door-to-door transportation across British Columbia',
    heroTagline: lang === 'zh' ? '专业接送' : 'PROFESSIONAL TRANSFERS',
    highlights: lang === 'zh'
      ? ['覆盖大温哥华及周边地区', '机场 / 邮轮码头 / 滑雪度假村接送', '适合家庭与小团体出行', '可按行程定制']
      : ['Serving Greater Vancouver & BC', 'Airport, cruise & ski transfers', 'Perfect for families & groups', 'Customizable to your schedule'],
    whyUs: lang === 'zh' ? '为什么选择我们' : 'Why Choose Qualitour',
    ourFleet: lang === 'zh' ? '车队与包车服务' : 'Fleet & Charter Services',
    fleetDesc: lang === 'zh' ? '专注于小团体私人接送' : 'Specialized vehicles for every occasion',
    popularRoutes: lang === 'zh' ? '热门路线' : 'Popular Routes',
    routesDesc: lang === 'zh' ? '选择您的行程' : 'Select your journey',
    perVehicle: lang === 'zh' ? '每车' : 'per vehicle',
    bookNow: lang === 'zh' ? '立即预订' : 'Book Now',
    charterServices: lang === 'zh' ? '包车服务' : 'Charter Services',
    charterDesc: lang === 'zh' ? '按小时计费的灵活包车方案' : 'Flexible hourly rates for your custom itinerary',
    needQuote: lang === 'zh' ? '需要定制报价？' : 'Need a Custom Quote?',
    quoteDesc: lang === 'zh' ? '告诉我们您的行程，获取专属报价' : 'Share your travel plans and get a personalized quote',
    ctaTitle: lang === 'zh' ? '准备好出发了吗？' : 'Ready to Travel in Style?',
    ctaDesc: lang === 'zh' ? '让专业司机带您安全到达目的地' : 'Let our professional drivers take you where you need to go',
    getInTouch: lang === 'zh' ? '联系我们' : 'Get in Touch',
    customerReview: lang === 'zh' ? '客户评价' : 'What Our Customers Say',
  };

  const whyUsItems = [
    { icon: 'verified', title: lang === 'zh' ? '专业司机' : 'Professional Drivers', desc: lang === 'zh' ? '经验丰富、礼貌周到' : 'Experienced, courteous & knowledgeable' },
    { icon: 'schedule', title: lang === 'zh' ? '准时可靠' : 'Always On Time', desc: lang === 'zh' ? '实时航班追踪' : 'Real-time flight tracking included' },
    { icon: 'star', title: lang === 'zh' ? '优质车辆' : 'Premium Vehicles', desc: lang === 'zh' ? '舒适宽敞、定期维护' : 'Modern fleet, regularly maintained' },
    { icon: 'support_agent', title: lang === 'zh' ? '全程服务' : '24/7 Support', desc: lang === 'zh' ? '随时为您解答' : 'We\'re here whenever you need us' },
  ];

  return (
    <main className="flex-grow">
      {/* Premium Hero Section */}
      {/* Premium Hero Section */}
      <PageHero
        image="/ski-shuttle.jpg"
        title={t.heading}
        subtitle={t.subheading}
        badge={{ icon: 'airport_shuttle', text: t.heroTagline }}
      >
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <a
            href="#routes"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#f7941e] to-[#ff6b35] text-white font-bold rounded-full hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300"
          >
            <span className="material-icons">route</span>
            {t.popularRoutes}
          </a>
          <Link
            href={`${localePrefix}/contact`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <span className="material-icons">mail</span>
            {t.getInTouch}
          </Link>
        </div>
      </PageHero>

      {/* Why Choose Us */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-orange-50 to-transparent" />

        <Container className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.whyUs}</h2>
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

      {/* Fleet & Charter Services */}
      <section id="charter" className="py-20 bg-gray-50 scroll-mt-20">
        <Container>
          <div className="text-center mb-16">
            <span className="text-[#f7941e] font-bold tracking-widest uppercase text-sm mb-2 block">{t.ourFleet}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.charterDesc}</h2>
          </div>

          {/* Charter Rates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {CHARTER_RATES.map((rate, idx) => (
              <div
                key={idx}
                className={`relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${rate.popular ? 'ring-2 ring-[#f7941e] transform scale-105' : ''
                  }`}
              >
                {rate.popular && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-[#f7941e] to-[#ff6b35] text-white text-xs font-bold rounded-full">
                    POPULAR
                  </div>
                )}

                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50 p-6 flex items-center justify-center">
                  <img
                    src={rate.imageUrl}
                    alt={rate.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{rate.title}</h3>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold text-[#f7941e]">${rate.priceNumber}</span>
                    <span className="text-gray-500">{rate.priceUnit}</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {rate.bullets.map((b, bidx) => (
                      <li key={bidx} className="flex items-start gap-3 text-gray-600">
                        <span className="material-icons text-green-500 text-lg mt-0.5">check</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`${localePrefix}/contact`}
                    className="block w-full text-center py-3 bg-gray-100 hover:bg-[#f7941e] text-gray-700 hover:text-white font-semibold rounded-xl transition-all duration-300"
                  >
                    {t.needQuote}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Vehicle Specifications */}
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900">{t.fleetDesc}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FLEET_ITEMS.map((item, idx) => (
              <div key={idx} className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50 p-6 flex items-center justify-center">
                  <img
                    src={item.imageUrl}
                    alt={item.label}
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{item.label}</h3>
                  <p className="text-[#f7941e] font-semibold mb-4">{item.capacity}</p>
                  <ul className="space-y-2">
                    {item.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-center gap-2 text-gray-600 text-sm">
                        <span className="material-icons text-green-500 text-base">check_circle</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Popular Routes */}
      <section id="routes" className="py-20 bg-white scroll-mt-20">
        <Container>
          <div className="text-center mb-16">
            <span className="text-[#f7941e] font-bold tracking-widest uppercase text-sm mb-2 block">{t.popularRoutes}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.routesDesc}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRANSFER_OFFERS.map((offer, idx) => {
              const price = extractPriceNumber(offer.caption);
              return (
                <div
                  key={idx}
                  className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#f7941e]/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#f7941e]/10 to-transparent rounded-bl-full" />

                  {/* Icon */}
                  <div className="w-14 h-14 bg-gradient-to-br from-[#f7941e]/10 to-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-icons text-[#f7941e] text-2xl">{offer.icon || 'airport_shuttle'}</span>
                  </div>

                  {/* Route */}
                  <div className="mb-4">
                    <div className="font-bold text-gray-900 text-lg leading-relaxed">
                      {offer.titleLines[0]}
                    </div>
                    <div className="text-[#f7941e] font-bold my-1">{offer.titleLines[1]}</div>
                    <div className="font-bold text-gray-900 text-lg">
                      {offer.titleLines[2]}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {price && (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">${price}</span>
                        <span className="text-gray-500 text-sm">{t.perVehicle}</span>
                      </div>
                    )}
                  </div>

                  {/* Booking buttons */}
                  <div className="flex flex-wrap gap-2">
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
                          className="px-4 py-2 bg-[#f7941e] hover:bg-[#e68a1c] text-white text-sm font-semibold rounded-lg transition-colors"
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
        </Container>
      </section>

      {/* Customer Reviews */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.customerReview}</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#f7941e] to-[#ff6b35] mx-auto rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10">
            <FeaturedGoogleReview lang={lang} mode="all" />
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <span className="text-[#f7941e] font-bold tracking-widest uppercase text-sm mb-2 block">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{lang === 'zh' ? '常见问题' : 'Frequently Asked Questions'}</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: lang === 'zh' ? '价格包含哪些内容？' : 'What is included in the price?',
                a: lang === 'zh' ? '一切！没有额外惊喜或隐藏费用。价格包含燃油附加费和5%的GST。' : 'Everything! There will be no added surprises or hidden costs. The price includes fuel surcharge and 5% GST.'
              },
              {
                q: lang === 'zh' ? '如何在机场找到你们？' : 'How do I find you at the airport?',
                a: lang === 'zh' ? '通关后请走到主要出口。我们的司机将举着写有您名字的牌子等候。' : 'Once you clear customs and immigration, walk to the main exit door. Our driver will hold a signboard with your name to wait for you.'
              },
              {
                q: lang === 'zh' ? '如果航班延误怎么办？' : 'What if our flight is delayed?',
                a: lang === 'zh' ? '我们会监控进港航班。最长等待时间为75分钟，超时将收取额外费用。' : 'We will monitor the arrival flights. The maximum waiting time is 75 minutes and will have additional cost after 75 minutes waiting time.'
              },
              {
                q: lang === 'zh' ? '提供儿童座椅吗？' : 'Do you have car seats available?',
                a: lang === 'zh' ? '是的，我们提供儿童座椅。请在预订时备注儿童年龄。' : 'Yes, we have child’s car seats available. However when you make your booking don’t forget to indicate the age of the child in the comments.'
              },
              {
                q: lang === 'zh' ? '除了接送，可以预订一日游吗？' : 'Is it possible to book day trips?',
                a: lang === 'zh' ? '是的，我们也提供一日游和包车服务。' : 'As well as our transfer services we also offer day trips and journeys in the area. We also offer a guided tour and bringing clients to their desired location.'
              },
              {
                q: lang === 'zh' ? '如何知道行李是否放得下？' : 'How will I know if my luggage fits?',
                a: lang === 'zh' ? '预订时请注明行李数量（如：2个滑雪包和2个手提箱）。如有疑问，请联系 info@qualitour.ca。' : 'When you are making the reservation specify the number of your luggage items you are bringing. For example; 2 ski bags and 2 suitcases. If you have any queries about this, you can contact our support team.'
              },
              {
                q: lang === 'zh' ? '需要给小费吗？' : 'What about gratuities?',
                a: lang === 'zh' ? '小费由客户自行决定。' : 'Tipping is at the discretion of the customers.'
              },
              {
                q: lang === 'zh' ? '找不到司机怎么办？' : 'What should I do if I can\'t find the driver?',
                a: lang === 'zh' ? '我们会在服务前2天通知您司机的姓名和手机号。如仍无法联系，请联系我们的客服团队。' : 'Our operational team will notify you our driver’s name and mobile 2 days prior to your service. If you are still unable get in contact with the driver, you can get in touch with our support team.'
              },
              {
                q: lang === 'zh' ? '如何取消预订？' : 'Cancellation Policy',
                a: lang === 'zh' ? '服务前72小时可免费取消（扣除5%手续费）。72小时内取消不退款。' : 'Cancellations can be made anytime until 72 hours prior to the service, but refunds are subject to an administration fee of 5% of the total amount. After that time, all bookings will be considered non-refundable.'
              }
            ].map((item, i) => (
              <details key={i} className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-bold text-gray-900 group-open:text-[#f7941e] transition-colors">{item.q}</span>
                  <span className="material-icons text-gray-400 group-open:text-[#f7941e] group-open:rotate-180 transition-all duration-300">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </Container>
      </section>



      {/* Quote CTA */}
      <section className="py-16 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-[#f7941e]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#f7941e] to-[#ff6b35] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <span className="material-icons text-white text-4xl">request_quote</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.needQuote}</h2>
              <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">{t.quoteDesc}</p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href={`${localePrefix}/contact`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#f7941e] to-[#ff6b35] text-white font-bold rounded-full hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300"
                >
                  <span className="material-icons">mail</span>
                  {t.getInTouch}
                </Link>
                <a
                  href="tel:+17789456000"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <span className="material-icons">call</span>
                  +1 (778) 945-6000
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-[#f7941e] to-[#ff6b35] relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#fff_1px,transparent_1px)] [background-size:24px_24px]" />

        <Container className="relative z-10">
          <div className="text-center text-white max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">{t.ctaTitle}</h2>
            <p className="text-xl opacity-90 mb-10">{t.ctaDesc}</p>
            <Link
              href={`${localePrefix}/contact`}
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-[#f7941e] font-bold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <span className="material-icons">arrow_forward</span>
              {t.getInTouch}
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
