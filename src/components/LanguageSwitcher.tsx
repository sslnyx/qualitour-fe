'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { i18n, type Locale, localeLabels, getLocalePrefix, getLocaleFromPathname } from '@/i18n/config';

export default function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();

  // Get the path for a different locale
  const getLocalizedPath = (targetLocale: Locale) => {
    // Remove any locale prefix from the current path
    let pathWithoutLocale = pathname.replace(/^\/zh(?=\/|$)/, '');
    // If path is empty after removing locale, use root
    const basePath = pathWithoutLocale || '/';
    // Add target locale prefix (empty string for 'en')
    const targetPrefix = getLocalePrefix(targetLocale);
    return `${targetPrefix}${basePath}`;
  };

  return (
    <button
      type="button"
      className="px-3 py-1 rounded transition-colors bg-primary text-gray-900 font-semibold cursor-pointer"
      onClick={() => {
        const nextLocale = currentLocale === 'en' ? 'zh' : 'en';
        window.location.href = getLocalizedPath(nextLocale);
      }}
      aria-label={`Switch language to ${currentLocale === 'en' ? '中文' : 'EN'}`}
    >
      {currentLocale === 'en' ? '中文' : 'EN'}
    </button>
  );
}
