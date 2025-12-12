'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Container from '@/components/ui/Container';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type { Locale } from '@/i18n/config';
import { getLocalePrefix } from '@/i18n/config';

// Navigation menu structure
const navigation = [
  {
    name: 'Services',
    href: '#',
    submenu: [
      { name: 'Private Transfers', href: '/private-transfers' },
      { name: 'China Visa', href: '/visa' },
      { name: 'Insurance Plans', href: '/insurance-services' },
    ],
  },
  {
    name: 'Experiences',
    href: '#',
    submenu: [
      { name: 'Tours', href: '/tours' },
      { name: 'Viking Cruises', href: '/viking-tours' },
      { name: 'Hotels & Accommodations', href: '/hotels-accommodations' },
      { name: 'Attractions & Activities', href: '/attractions' },
      { name: 'Search Tours', href: '/search-tours' },
    ],
  },
  {
    name: 'Destinations',
    href: '#',
    submenu: [
      { name: 'Yellowknife', href: '/yellowknife' },
      { name: 'Whitehorse', href: '/whitehorse' },
      { name: 'Africa', href: '/africa' },
    ],
  },
  {
    name: 'Private Transfers',
    href: '/private-transfers',
    submenu: [
      { name: 'YVR Airport ↔ Canada Place Terminal', href: '/private-transfers/pt-yvr-cruise' },
      { name: 'Vancouver ↔ Seattle', href: '/private-transfers/pt-yvr-seattle' },
      { name: 'Vancouver ↔ Sun Peaks', href: '/private-transfers/pt-yvr-sunpeaks' },
      { name: 'Vancouver ↔ Whistler', href: '/private-transfers/pt-whistler-yvr' },
    ],
  },
  { name: 'About Us', href: '/about-us' },
  { name: 'Contact Us', href: '/contact' },
];

export default function Header({ lang }: { lang: Locale }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  // Get the locale prefix (empty for 'en', '/zh' for Chinese)
  const localePrefix = getLocalePrefix(lang);

  const handleMouseEnter = (itemName: string) => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setOpenDropdown(itemName);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setOpenDropdown(null);
    }, 200); // 200ms delay before closing
    setCloseTimeout(timeout);
  };

  return (
    <header className="bg-white text-text-heading sticky top-0 z-50 border-b border-border">
      <Container>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`${localePrefix}/`} className="flex items-center" style={{ paddingTop: '34px', paddingBottom: '36px' }}>
            <Image 
              src="http://qualitour.local/wp-content/uploads/2023/11/Title-logo-rasterisation-optimised.svg"
              alt="Qualitour"
              width={175}
              height={48}
              className="w-[175px] h-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative group"
                onMouseEnter={() => item.submenu && handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                {item.submenu ? (
                  <>
                    <button className="text-[#828282] hover:text-primary transition-colors font-semibold uppercase text-sm tracking-wider">
                      {item.name}
                    </button>
                    {openDropdown === item.name && (
                      <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md py-2 min-w-[220px]">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.name}
                            href={`${localePrefix}${subitem.href}`}
                            className="block px-4 py-2 text-sm text-[#828282] hover:text-primary hover:bg-gray-50 transition-colors"
                          >
                            {subitem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={`${localePrefix}${item.href}`}
                    className="text-[#828282] hover:text-primary transition-colors font-semibold uppercase text-sm tracking-wider"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            
            {/* Language Switcher */}
            <div className="ml-4">
              <LanguageSwitcher currentLocale={lang} />
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                        className="w-full text-left py-2 text-text-heading hover:text-primary transition-colors font-medium flex items-center justify-between"
                      >
                        {item.name}
                        <svg
                          className={`w-4 h-4 transition-transform ${openDropdown === item.name ? 'rotate-180' : ''}`}
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {openDropdown === item.name && (
                        <div className="pl-4 space-y-2">
                          {item.submenu.map((subitem) => (
                            <Link
                              key={subitem.name}
                              href={`${localePrefix}${subitem.href}`}
                              className="block py-1 text-sm text-[#828282] hover:text-primary transition-colors"
                            >
                              {subitem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={`${localePrefix}${item.href}`}
                      className="block py-2 text-text-heading hover:text-primary transition-colors font-medium"
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              
              {/* Mobile Language Switcher */}
              <div className="pt-4 border-t border-border">
                <LanguageSwitcher currentLocale={lang} />
              </div>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}
