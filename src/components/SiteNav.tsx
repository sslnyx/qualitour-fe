"use client";
import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import QualitourLogo from '@/assets/Title-logo-rasterisation-optimised.svg';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { getLocalePrefix } from '@/i18n/config';
import type { Locale } from '@/i18n/config';
import Link from "next/link";
import { WPTourActivity, WPTourDestination, WPTourDuration, WPTourType } from '@/lib/wordpress/types';
import { organizeDestinations } from '@/lib/navigation-mapper';
import { useRouter } from 'next/navigation';
import { decodeHtmlEntities } from '@/lib/decodeHtmlEntities';

// Brand color
const brandOrange = "#f7941e";

type NavDict = {
  navigation?: Record<string, string>;
  common?: Record<string, string>;
};

type TreeNode<T> = T & { children: Array<TreeNode<T>> };

type TermLike = {
  id: number;
  parent: number;
};

interface SiteNavProps {
  lang: Locale;
  activities?: WPTourActivity[];
  destinations?: WPTourDestination[];
  durations?: WPTourDuration[];
  types?: WPTourType[];
  dict?: NavDict;
}

function buildTree<T extends TermLike>(items: T[] | undefined): Array<TreeNode<T>> {
  if (!items || items.length === 0) return [];
  const map = new Map<number, TreeNode<T>>();
  const roots: Array<TreeNode<T>> = [];

  // Preserve incoming term order (WordPress already returns terms ordered by name).
  // Avoid locale-dependent sorting here to prevent SSR/CSR ordering differences
  // that can cause hydration mismatches.
  items.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  items.forEach((item) => {
    if (item.parent !== 0 && map.has(item.parent)) {
      map.get(item.parent)!.children.push(map.get(item.id)!);
    } else {
      roots.push(map.get(item.id)!);
    }
  });
  return roots;
}

export default function SiteNav({ lang, activities = [], destinations = [], durations = [], types = [], dict }: SiteNavProps) {
  const router = useRouter();
  const localePrefix = getLocalePrefix(lang);
  const [megaOpen, setMegaOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [servicesMobileOpen, setServicesMobileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mouseOutDelay = 250;
  const mouseOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const servicesMouseOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefetchOnIntent = useCallback(
    (href: string) => {
      if (typeof window === 'undefined') return;
      // Avoid doing work on touch-only devices.
      if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) return;
      router.prefetch(href);
    },
    [router]
  );

  const prefetchOnInteraction = useCallback(
    (href: string) => {
      if (typeof window === 'undefined') return;
      router.prefetch(href);
    },
    [router]
  );

  const intentPrefetchProps = (href: string) => ({
    onMouseEnter: () => prefetchOnIntent(href),
    onFocus: () => prefetchOnIntent(href),
    onTouchStart: () => prefetchOnInteraction(href),
    onPointerDown: () => prefetchOnInteraction(href),
  });

  // Get translation function
  const t = (key: string, defaultValue: string = key) => dict?.navigation?.[key] || defaultValue;
  const tc = (key: string, defaultValue: string = key) => dict?.common?.[key] || defaultValue;

  const TOUR_TYPE_SLUGS = ['attraction-tickets', 'land-tours', 'cruises'] as const;

  const typesBySlug = new Map(types.map((term) => [term.slug, term]));

  const tourTypeLinks = TOUR_TYPE_SLUGS.map((slug) => {
    const term = typesBySlug.get(slug);
    const fallbackLabel =
      slug === 'attraction-tickets'
        ? t('attractionTickets', 'Tickets & Passes')
        : slug === 'land-tours'
          ? t('packageTours', 'Land Tours')
          : t('cruises', 'Cruises & Expeditions');

    return {
      label: decodeHtmlEntities(term?.name || fallbackLabel),
      slug,
      type: 'type',
    };
  });

  const DURATION_BUCKET_SLUGS = [
    'single-day',
    'short-breaks',
    'weeklong',
    'extended-journeys',
    'grand-voyages',
  ] as const;

  const durationsBySlug = new Map(durations.map((term) => [term.slug, term]));

  const durationLinks = DURATION_BUCKET_SLUGS.map((slug) => {
    const term = durationsBySlug.get(slug);
    const fallbackLabel =
      slug === 'single-day'
        ? t('singleDayTickets', 'Single-Day Tickets')
        : slug === 'short-breaks'
          ? t('shortBreaks', '1–4 Days (Short Breaks)')
          : slug === 'weeklong'
            ? t('weeklong', '5–8 Days (Weeklong)')
            : slug === 'extended-journeys'
              ? t('extendedJourneys', '9-29 Days (Extended Journeys)')
              : t('grandVoyages', '30+ Days (Grand Voyages)');

    return { label: decodeHtmlEntities(term?.name || fallbackLabel), slug };
  });

  // Build the destination tree from WP term parent relationships,
  // with a conservative fallback mapping to prevent "floating" items.
  const destinationTree = buildTree<WPTourDestination>(organizeDestinations(destinations));
  const activityTree = buildTree<WPTourActivity>(activities);

  // Helper to close megamenu when a link is clicked
  const handleMegamenuLinkClick = () => {
    setMegaOpen(false);
  };

  const serviceLinks = [
    {
      label: t('privateTransfers', 'Private Transfers'),
      href: `${localePrefix}/private-transfers`,
    },
    {
      label: t('chinaVisa', 'China Visa'),
      href: `${localePrefix}/visa`,
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 w-full z-50">
      <div className="container-qualitour">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            prefetch={false}
            href={localePrefix + '/'}
            className="flex items-center"
            style={{ paddingTop: '8px', paddingBottom: '8px' }}
            {...intentPrefetchProps(localePrefix + '/')}
          >
            <Image 
              src={QualitourLogo}
              alt="Qualitour"
              width={175}
              height={48}
              className="w-[175px] h-auto"
              style={{ width: 'auto', height: 'auto' }}
            />
          </Link>
          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center space-x-2 lg:space-x-4">
          <li>
            <Link
              prefetch={false}
              href={localePrefix + '/'}
              className="px-4 py-2 text-gray-700 hover:text-[#f7941e] font-medium"
              {...intentPrefetchProps(localePrefix + '/')}
            >
              {tc('home', 'Home')}
            </Link>
          </li>
          <li
            className="relative"
            onMouseEnter={() => {
              if (servicesMouseOutTimerRef.current) {
                clearTimeout(servicesMouseOutTimerRef.current);
                servicesMouseOutTimerRef.current = null;
              }
              setServicesOpen(true);
            }}
            onMouseLeave={() => {
              servicesMouseOutTimerRef.current = setTimeout(() => {
                setServicesOpen(false);
              }, mouseOutDelay);
            }}
          >
            <button className="px-4 py-2 text-gray-700 hover:text-[#f7941e] font-medium flex items-center">
              {t('services', 'Services')}{' '}
              <span className="material-symbols-outlined ml-1 text-[18px]">expand_more</span>
            </button>

            {servicesOpen && (
              <div className="absolute left-0 top-full mt-1 min-w-[220px] bg-white shadow-lg border border-gray-200 rounded-md py-2">
                {serviceLinks.map((item) => (
                  <Link
                    key={item.href}
                    prefetch={false}
                    href={item.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:text-[#f7941e] hover:bg-gray-50"
                    {...intentPrefetchProps(item.href)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </li>
          <li
            className="relative"
            onMouseEnter={() => {
              if (mouseOutTimerRef.current) {
                clearTimeout(mouseOutTimerRef.current);
                mouseOutTimerRef.current = null;
              }
              setMegaOpen(true);
            }}
            onMouseLeave={() => {
              mouseOutTimerRef.current = setTimeout(() => {
                setMegaOpen(false);
              }, mouseOutDelay);
            }}
          >
            <button className="px-4 py-2 text-gray-700 hover:text-[#f7941e] font-medium flex items-center">
              {t('tours', 'Tours')} <span className="material-symbols-outlined ml-1 text-[18px]">expand_more</span>
            </button>
            {/* Mega Menu */}
            {megaOpen && (
              <div className="fixed left-0 right-0 top-16 z-100 flex justify-center pointer-events-auto">
                <div className="w-full max-w-7xl bg-white shadow-2xl border border-gray-200 rounded-xl flex p-8" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                  {/* By Tour Type */}
                  <div className="flex-1 px-4">
                    <h4 className="font-semibold text-gray-900 border-b-2 pb-2 mb-3" style={{ borderColor: brandOrange }}>{t('tourTypes', 'By Tour Type')}</h4>
                    <ul className="space-y-1">
                      {tourTypeLinks.map((link) => (
                        <li key={link.slug}>
                          <Link
                            prefetch={false}
                            href={localePrefix + `/tours/${link.type}/${link.slug}`}
                            onClick={handleMegamenuLinkClick}
                            className="hover:text-[#f7941e]"
                            {...intentPrefetchProps(localePrefix + `/tours/${link.type}/${link.slug}`)}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                      <li className="pt-2">
                        <Link
                          prefetch={false}
                          href={localePrefix + '/tours/duration'}
                          className="font-bold text-[#f7941e]"
                          {...intentPrefetchProps(localePrefix + '/tours/duration')}
                        >
                          {t('byDuration', 'By Duration')}
                        </Link>
                      </li>
                      <li>
                        <Link
                          prefetch={false}
                          href={localePrefix + '/tours/search'}
                          className="font-bold text-[#f7941e]"
                          {...intentPrefetchProps(localePrefix + '/tours/search')}
                        >
                          {t('searchAllTours', 'Search All Tours')}
                        </Link>
                      </li>
                      <li>
                        <Link
                          prefetch={false}
                          href={localePrefix + '/tours/featured'}
                          className="font-bold"
                          {...intentPrefetchProps(localePrefix + '/tours/featured')}
                        >
                          {t('featuredTours', 'Featured Tours')}
                        </Link>
                      </li>
                    </ul>
                  </div>
                  {/* By Destination - Dynamic Grid */}
                  <div className="flex-2 px-4">
                    <h4 className="font-semibold text-gray-900 border-b-2 pb-2 mb-3" style={{ borderColor: brandOrange }}>{t('destinations', 'By Destination')}</h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                      {destinationTree.map((dest) => (
                        <div key={dest.id} className="break-inside-avoid mb-2">
                          {dest.children.length > 0 ? (
                            <>
                              <Link
                                prefetch={false}
                                href={`${localePrefix}/tours/destination/${dest.slug}`}
                                onClick={handleMegamenuLinkClick}
                                className="font-bold text-gray-800 hover:text-[#f7941e] mb-1 flex items-center"
                                {...intentPrefetchProps(`${localePrefix}/tours/destination/${dest.slug}`)}
                              >
                                {decodeHtmlEntities(dest.name)}
                                <span className="material-symbols-outlined ml-1 text-[16px]">chevron_right</span>
                              </Link>
                              <ul className="space-y-1 pl-3 border-l-2 border-gray-100">
                                {dest.children.map((child) => (
                                  <li key={child.id}>
                                    <Link
                                      prefetch={false}
                                      href={`${localePrefix}/tours/destination/${child.slug}`}
                                      onClick={handleMegamenuLinkClick}
                                      className="text-sm text-gray-600 hover:text-[#f7941e] block py-0.5"
                                      {...intentPrefetchProps(`${localePrefix}/tours/destination/${child.slug}`)}
                                    >
                                      {decodeHtmlEntities(child.name)}
                                    </Link>
                                    {/* Third Level (Cities/Regions) */}
                                    {child.children && child.children.length > 0 && (
                                      <ul className="pl-3 mt-0.5 space-y-0.5 border-l border-gray-200 ml-1">
                                          {child.children.map((grandchild) => (
                                          <li key={grandchild.id}>
                                            <Link
                                              prefetch={false}
                                              href={`${localePrefix}/tours/destination/${grandchild.slug}`}
                                              onClick={handleMegamenuLinkClick}
                                              className="text-xs text-gray-500 hover:text-[#f7941e] block py-0.5"
                                              {...intentPrefetchProps(`${localePrefix}/tours/destination/${grandchild.slug}`)}
                                            >
                                              {decodeHtmlEntities(grandchild.name)}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            <Link
                              prefetch={false}
                              href={`${localePrefix}/tours/destination/${dest.slug}`}
                              onClick={handleMegamenuLinkClick}
                              className="font-medium text-gray-700 hover:text-[#f7941e] block py-1"
                              {...intentPrefetchProps(`${localePrefix}/tours/destination/${dest.slug}`)}
                            >
                              {decodeHtmlEntities(dest.name)}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* By Experience */}
                  <div className="flex-1 px-4">
                    <h4 className="font-semibold text-gray-900 border-b-2 pb-2 mb-3" style={{ borderColor: brandOrange }}>{t('experiences', 'By Experience')}</h4>
                    <ul className="space-y-1">
                      {activityTree.map((activity) => (
                        <li key={activity.id}>
                          <Link
                            prefetch={false}
                            href={localePrefix + `/tours/activity/${activity.slug}`}
                            onClick={handleMegamenuLinkClick}
                            className="hover:text-[#f7941e]"
                            {...intentPrefetchProps(localePrefix + `/tours/activity/${activity.slug}`)}
                          >
                            {decodeHtmlEntities(activity.name)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* By Duration */}
                  <div className="flex-1 px-4">
                    <h4 className="font-semibold text-gray-900 border-b-2 pb-2 mb-3" style={{ borderColor: brandOrange }}>{t('byDuration', 'By Duration')}</h4>
                    <ul className="space-y-1">
                      {durationLinks.map((link) => (
                        <li key={link.slug}>
                          <Link
                            prefetch={false}
                            href={localePrefix + `/tours/duration/${link.slug}`}
                            onClick={handleMegamenuLinkClick}
                            className="hover:text-[#f7941e]"
                            {...intentPrefetchProps(localePrefix + `/tours/duration/${link.slug}`)}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </li>
          <li>
            <Link
              prefetch={false}
              href={localePrefix + '/about-us'}
              className="px-4 py-2 text-gray-700 hover:text-[#f7941e] font-medium"
              {...intentPrefetchProps(localePrefix + '/about-us')}
            >
              {t('aboutUs', 'About')}
            </Link>
          </li>
          <li>
            <Link
              prefetch={false}
              href={localePrefix + '/contact'}
              className="px-4 py-2 text-gray-700 hover:text-[#f7941e] font-medium"
              {...intentPrefetchProps(localePrefix + '/contact')}
            >
              {t('contactUs', 'Contact')}
            </Link>
          </li>
          <li>
            <Link
              prefetch={false}
              href={localePrefix + '/faq'}
              className="px-4 py-2 text-gray-700 hover:text-[#f7941e] font-medium"
              {...intentPrefetchProps(localePrefix + '/faq')}
            >
              {t('faq', 'FAQ')}
            </Link>
          </li>
        </ul>
        {/* Language Switcher */}
        <div className="hidden md:block ml-4">
          <LanguageSwitcher currentLocale={lang} />
        </div>
        {/* Mobile Hamburger */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          <span className="sr-only">Open menu</span>
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-2">
          <ul className="space-y-2">
            <li><Link prefetch={false} href={localePrefix + '/'} className="block py-2 text-gray-700 font-medium">{tc('home', 'Home')}</Link></li>
            <li>
              <button
                className="block w-full text-left py-2 text-gray-700 font-medium"
                onClick={() => setServicesMobileOpen(!servicesMobileOpen)}
              >
                {t('services', 'Services')}{' '}
                <span className="material-symbols-outlined ml-1 text-[18px]">expand_more</span>
              </button>
              {servicesMobileOpen && (
                <div className="bg-gray-50 border rounded mt-2 p-2">
                  <ul className="ml-2">
                    {serviceLinks.map((item) => (
                      <li key={item.href}>
                        <Link prefetch={false} href={item.href} onClick={() => setMobileOpen(false)}>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
            <li>
              <button className="block w-full text-left py-2 text-gray-700 font-medium" onClick={() => setMegaOpen(!megaOpen)}>
                {t('tours', 'Tours')} <span className="material-symbols-outlined ml-1 text-[18px]">expand_more</span>
              </button>
              {megaOpen && (
                <div className="bg-gray-50 border rounded mt-2 p-2">
                  <div className="mb-2">
                    <span className="font-semibold text-gray-900" style={{ color: brandOrange }}>{t('tourTypes', 'By Tour Type')}</span>
                    <ul className="ml-2">
                      {tourTypeLinks.map((link) => (
                        <li key={link.slug}>
                          <Link prefetch={false} href={localePrefix + `/tours/${link.type}/${link.slug}`} onClick={() => setMobileOpen(false)}>
                            {link.label}
                          </Link>
                        </li>
                      ))}
                      <li className="pt-2"><Link prefetch={false} href={localePrefix + '/tours/duration'} className="font-bold text-[#f7941e]">{t('byDuration', 'By Duration')}</Link></li>
                      <li><Link prefetch={false} href={localePrefix + '/tours/search'} className="font-bold text-[#f7941e]">{t('searchAllTours', 'Search All Tours')}</Link></li>
                      <li><Link prefetch={false} href={localePrefix + '/tours/featured'} className="font-bold">{t('featuredTours', 'Featured Tours')}</Link></li>
                    </ul>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-900" style={{ color: brandOrange }}>{t('destinations', 'By Destination')}</span>
                    <ul className="ml-2">
                      {destinationTree.map((dest) => (
                        <li key={dest.id}>
                          <Link prefetch={false} href={`${localePrefix}/tours/destination/${dest.slug}`}>{decodeHtmlEntities(dest.name)}</Link>
                          {dest.children.length > 0 && (
                            <ul className="ml-2 border-l pl-2">
                              {dest.children.map((child) => (
                                <li key={child.id}>
                                  <Link prefetch={false} href={`${localePrefix}/tours/destination/${child.slug}`}>{decodeHtmlEntities(child.name)}</Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-900" style={{ color: brandOrange }}>{t('experiences', 'By Experience')}</span>
                    <ul className="ml-2">
                      {activityTree.map((activity) => (
                        <li key={activity.id}>
                          <Link prefetch={false} href={`${localePrefix}/tours/activity/${activity.slug}`} onClick={() => setMobileOpen(false)}>{activity.name}</Link>
                          {activity.children && activity.children.length > 0 && (
                            <ul className="ml-2 border-l pl-2">
                              {activity.children.map((child) => (
                                <li key={child.id}>
                                  <Link prefetch={false} href={`${localePrefix}/tours/activity/${child.slug}`} onClick={() => setMobileOpen(false)}>{child.name}</Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900" style={{ color: brandOrange }}>{t('byDuration', 'By Duration')}</span>
                    <ul className="ml-2">
                      {durationLinks.map((link) => (
                        <li key={link.slug}>
                          <Link prefetch={false} href={localePrefix + `/tours/duration/${link.slug}`} onClick={() => setMobileOpen(false)}>
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>
            <li><Link prefetch={false} href={localePrefix + '/about-us'} className="block py-2 text-gray-700 font-medium">About</Link></li>
            <li><Link prefetch={false} href={localePrefix + '/contact'} className="block py-2 text-gray-700 font-medium">Contact</Link></li>
            <li><Link prefetch={false} href={localePrefix + '/faq'} className="block py-2 text-gray-700 font-medium">FAQ</Link></li>
            <li><Link href="#" className="block py-2 text-gray-700 font-medium border border-gray-300 rounded mt-2" style={{ borderColor: brandOrange }}>EN / ZH</Link></li>
          </ul>
        </div>
      )}
    </nav>
  );
}
