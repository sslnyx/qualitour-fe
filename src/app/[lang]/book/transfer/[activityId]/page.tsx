import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import type { Locale } from '@/i18n/config';
import { getLocalePrefix } from '@/i18n/config';

export const runtime = 'edge';

const ALLOWED_ACTIVITY_IDS = new Set([
  '16',
  '18',
  '20',
  '53',
  '54',
  '55',
  '82',
  '83',
  '84',
  '85',
  '88',
  '89',
  '95',
  '96',
  '97',
  '98',
]);

function getBookingUrl(activityId: string): string {
  return `https://qualitour.zaui.net/booking/web/#/default/activity/${activityId}?`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; activityId: string }>;
}): Promise<Metadata> {
  const { lang, activityId } = await params;
  const localePrefix = getLocalePrefix(lang);

  const canonicalPath = `${localePrefix}/book/transfer/${activityId}`;

  return {
    title: lang === 'zh' ? '预订接送服务 | Qualitour' : 'Book a Transfer | Qualitour',
    description:
      lang === 'zh'
        ? '在 Qualitour 站内完成接送服务预订。'
        : 'Complete your transfer booking without leaving Qualitour.',
    alternates: {
      canonical: canonicalPath,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function TransferBookingPage({
  params,
}: {
  params: Promise<{ lang: Locale; activityId: string }>;
}) {
  const { lang, activityId } = await params;
  const localePrefix = getLocalePrefix(lang);

  if (!ALLOWED_ACTIVITY_IDS.has(activityId)) {
    return (
      <main className="grow">
        <Container>
          <div className="py-16">
            <h1 className="text-2xl font-bold text-text-heading">
              {lang === 'zh' ? '无效的预订链接' : 'Invalid booking link'}
            </h1>
            <p className="text-text-muted mt-2">
              {lang === 'zh'
                ? '该预订链接不可用。请返回接送页面重新选择。'
                : 'This booking link is not available. Please return to the transfers page and try again.'}
            </p>
            <div className="mt-6">
              <Link
                href={`${localePrefix}/private-transfers`}
                className="inline-block px-6 py-3 bg-[#f7941e] hover:bg-[#e68a1c] text-white font-semibold rounded-md transition-colors"
              >
                {lang === 'zh' ? '返回私人接送' : 'Back to Private Transfers'}
              </Link>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  const bookingUrl = getBookingUrl(activityId);

  return (
    <main className="grow">
      <section className="border-b border-gray-200 bg-white">
        <Container>
          <div className="py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-text-heading">
                {lang === 'zh' ? '预订接送服务' : 'Book your transfer'}
              </h1>
              <p className="text-text-muted">
                {lang === 'zh'
                  ? '预订页面由第三方 Zaui 提供。'
                  : 'Booking is powered by Zaui (third-party).'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`${localePrefix}/private-transfers`}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-text-heading font-semibold transition-colors"
              >
                {lang === 'zh' ? '返回' : 'Back'}
              </Link>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-md bg-[#f7941e] hover:bg-[#e68a1c] text-white font-semibold transition-colors"
              >
                {lang === 'zh' ? '新窗口打开' : 'Open in new tab'}
              </a>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-gray-50">
        <Container>
          <div className="py-6">
            <p className="text-sm text-text-muted mb-4">
              {lang === 'zh'
                ? '如果下方无法显示，可能是第三方限制了 iframe 嵌入。请点击“新窗口打开”。'
                : 'If the booking form does not load below, Zaui may be blocking iframe embedding. Use “Open in new tab”.'}
            </p>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <iframe
                title={lang === 'zh' ? 'Zaui 预订' : 'Zaui booking'}
                src={bookingUrl}
                className="w-full"
                style={{ height: '80vh' }}
                loading="lazy"
                sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
              />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
