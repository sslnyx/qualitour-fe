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
    <nav className="bg-white border-b border-gray-200 w-full sticky top-0 z-50">
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
              className="w-[175px] h-auto -ml-4"
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
              <div
                className={`fixed left-0 right-0 top-16 z-[100] flex justify-center pointer-events-auto transition-all duration-300 ease-out ${megaOpen
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}
              >
                <div className="w-full max-w-6xl mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}>
                  {/* Header Banner */}
                  <div className="bg-gradient-to-r from-[#f7941e] to-[#ff6b35] px-8 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-white text-2xl">explore</span>
                        <h3 className="text-white font-bold text-lg">Discover Your Next Adventure</h3>
                      </div>
                      <Link
                        prefetch={false}
                        href={localePrefix + '/tours'}
                        onClick={handleMegamenuLinkClick}
                        className="bg-white text-[#f7941e] px-5 py-2 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                        {...intentPrefetchProps(localePrefix + '/tours')}
                      >
                        <span>Browse All Tours</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="grid grid-cols-12 gap-8">
                      {/* By Tour Type - Left Column */}
                      <div className="col-span-3">
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#f7941e] text-lg">category</span>
                          {t('tourTypes', 'Tour Types')}
                        </h4>
                        <ul className="space-y-1">
                          {tourTypeLinks.map((link) => (
                            <li key={link.slug}>
                              <Link
                                prefetch={false}
                                href={localePrefix + `/tours/${link.type}/${link.slug}`}
                                onClick={handleMegamenuLinkClick}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-[#f7941e]/10 hover:text-[#f7941e] transition-all group"
                                {...intentPrefetchProps(localePrefix + `/tours/${link.type}/${link.slug}`)}
                              >
                                <span className="material-symbols-outlined text-lg text-gray-400 group-hover:text-[#f7941e] transition-colors">
                                  {link.slug === 'attraction-tickets' ? 'confirmation_number' : link.slug === 'land-tours' ? 'hiking' : 'sailing'}
                                </span>
                                <span className="font-medium">{link.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>

                        {/* Quick Links */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <Link
                            prefetch={false}
                            href={localePrefix + '/tours/featured'}
                            onClick={handleMegamenuLinkClick}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all"
                            {...intentPrefetchProps(localePrefix + '/tours/featured')}
                          >
                            <span className="material-symbols-outlined text-lg">star</span>
                            <span className="font-semibold">{t('featuredTours', 'Featured Tours')}</span>
                          </Link>
                        </div>
                      </div>

                      {/* By Destination - Center (Largest) */}
                      <div className="col-span-6 border-x border-gray-100 px-8">
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#f7941e] text-lg">public</span>
                          {t('destinations', 'Popular Destinations')}
                        </h4>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                          {destinationTree.map((dest) => (
                            <div key={dest.id} className="group">
                              <Link
                                prefetch={false}
                                href={`${localePrefix}/tours/destination/${dest.slug}`}
                                onClick={handleMegamenuLinkClick}
                                className="flex items-center gap-2 font-semibold text-gray-800 hover:text-[#f7941e] transition-colors py-1"
                                {...intentPrefetchProps(`${localePrefix}/tours/destination/${dest.slug}`)}
                              >
                                <span className="w-6 h-6 rounded-full bg-[#f7941e]/10 flex items-center justify-center text-xs font-bold text-[#f7941e] group-hover:bg-[#f7941e] group-hover:text-white transition-colors">
                                  {dest.name.charAt(0)}
                                </span>
                                {decodeHtmlEntities(dest.name)}
                                {dest.children.length > 0 && (
                                  <span className="material-symbols-outlined text-[14px] text-gray-400">chevron_right</span>
                                )}
                              </Link>
                              {dest.children.length > 0 && (
                                <ul className="ml-8 mt-1 space-y-0.5">
                                  {dest.children.slice(0, 4).map((child) => (
                                    <li key={child.id}>
                                      <Link
                                        prefetch={false}
                                        href={`${localePrefix}/tours/destination/${child.slug}`}
                                        onClick={handleMegamenuLinkClick}
                                        className="text-sm text-gray-500 hover:text-[#f7941e] transition-colors block py-0.5"
                                        {...intentPrefetchProps(`${localePrefix}/tours/destination/${child.slug}`)}
                                      >
                                        {decodeHtmlEntities(child.name)}
                                      </Link>
                                    </li>
                                  ))}
                                  {dest.children.length > 4 && (
                                    <li>
                                      <Link
                                        prefetch={false}
                                        href={`${localePrefix}/tours/destination/${dest.slug}`}
                                        onClick={handleMegamenuLinkClick}
                                        className="text-xs text-[#f7941e] font-medium hover:underline py-0.5"
                                        {...intentPrefetchProps(`${localePrefix}/tours/destination/${dest.slug}`)}
                                      >
                                        +{dest.children.length - 4} more
                                      </Link>
                                    </li>
                                  )}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* By Experience - Right Column */}
                      <div className="col-span-3">
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#f7941e] text-lg">interests</span>
                          {t('experiences', 'Experiences')}
                        </h4>
                        <ul className="space-y-1">
                          {activityTree.slice(0, 8).map((activity) => (
                            <li key={activity.id}>
                              <Link
                                prefetch={false}
                                href={localePrefix + `/tours/activity/${activity.slug}`}
                                onClick={handleMegamenuLinkClick}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-[#f7941e] transition-all text-sm"
                                {...intentPrefetchProps(localePrefix + `/tours/activity/${activity.slug}`)}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#f7941e]/50"></span>
                                {decodeHtmlEntities(activity.name)}
                              </Link>
                            </li>
                          ))}
                          {activityTree.length > 8 && (
                            <li className="pt-2">
                              <Link
                                prefetch={false}
                                href={localePrefix + '/tours'}
                                onClick={handleMegamenuLinkClick}
                                className="text-[#f7941e] font-medium text-sm hover:underline px-3"
                                {...intentPrefetchProps(localePrefix + '/tours')}
                              >
                                View all experiences →
                              </Link>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
          <button className="md:hidden p-2 -mr-3" onClick={() => setMobileOpen(!mobileOpen)}>
            <span className="sr-only">Open menu</span>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>
      {/* Mobile Menu - Premium Slide-in Drawer */}
      <div
        className={`fixed inset-0 z-[200] md:hidden transition-all duration-300 ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'
            }`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${mobileOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <Image
              src={QualitourLogo}
              alt="Qualitour"
              width={140}
              height={38}
              className="h-9 w-auto -ml-3"
            />
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors -mr-3"
            >
              <span className="material-symbols-outlined text-gray-600">close</span>
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto">
            <nav className="py-4">
              {/* Home */}
              <Link
                prefetch={false}
                href={localePrefix + '/'}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-5 py-3.5 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[#f7941e]">home</span>
                {tc('home', 'Home')}
              </Link>

              {/* Services Accordion */}
              <div className="border-t border-gray-100">
                <button
                  onClick={() => setServicesMobileOpen(!servicesMobileOpen)}
                  className="flex items-center justify-between w-full px-5 py-3.5 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#f7941e]">support_agent</span>
                    {t('services', 'Services')}
                  </div>
                  <span className={`material-symbols-outlined text-gray-400 transition-transform duration-200 ${servicesMobileOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${servicesMobileOpen ? 'max-h-40' : 'max-h-0'}`}>
                  <div className="bg-gray-50 py-2">
                    {serviceLinks.map((item) => (
                      <Link
                        key={item.href}
                        prefetch={false}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-8 py-2.5 text-gray-600 hover:text-[#f7941e] transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f7941e]/50"></span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tours Accordion */}
              <div className="border-t border-gray-100">
                <button
                  onClick={() => setMegaOpen(!megaOpen)}
                  className="flex items-center justify-between w-full px-5 py-3.5 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#f7941e]">explore</span>
                    {t('tours', 'Tours')}
                  </div>
                  <span className={`material-symbols-outlined text-gray-400 transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${megaOpen ? 'max-h-[2000px]' : 'max-h-0'}`}>
                  <div className="bg-gray-50">
                    {/* Browse All Tours CTA */}
                    <div className="px-5 py-4 bg-gradient-to-r from-[#f7941e] to-[#ff6b35]">
                      <Link
                        prefetch={false}
                        href={localePrefix + '/tours'}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center gap-2 bg-white text-[#f7941e] px-4 py-2.5 rounded-full font-semibold text-sm"
                      >
                        <span>Browse All Tours</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                    </div>

                    {/* Tour Types */}
                    <div className="px-5 py-4 border-b border-gray-200">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">category</span>
                        {t('tourTypes', 'Tour Types')}
                      </h4>
                      <div className="space-y-1">
                        {tourTypeLinks.map((link) => (
                          <Link
                            key={link.slug}
                            prefetch={false}
                            href={localePrefix + `/tours/${link.type}/${link.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 py-2 text-gray-700 hover:text-[#f7941e] transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg text-gray-400">
                              {link.slug === 'attraction-tickets' ? 'confirmation_number' : link.slug === 'land-tours' ? 'hiking' : 'sailing'}
                            </span>
                            {link.label}
                          </Link>
                        ))}
                        <Link
                          prefetch={false}
                          href={localePrefix + '/tours/featured'}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 py-2 text-amber-600 font-medium"
                        >
                          <span className="material-symbols-outlined text-lg">star</span>
                          {t('featuredTours', 'Featured Tours')}
                        </Link>
                      </div>
                    </div>

                    {/* Destinations */}
                    <div className="px-5 py-4 border-b border-gray-200">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">public</span>
                        {t('destinations', 'Destinations')}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {destinationTree.map((dest) => (
                          <Link
                            key={dest.id}
                            prefetch={false}
                            href={`${localePrefix}/tours/destination/${dest.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2 py-2 text-gray-700 hover:text-[#f7941e] transition-colors"
                          >
                            <span className="w-5 h-5 rounded-full bg-[#f7941e]/10 flex items-center justify-center text-[10px] font-bold text-[#f7941e]">
                              {dest.name.charAt(0)}
                            </span>
                            <span className="text-sm">{decodeHtmlEntities(dest.name)}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Experiences */}
                    <div className="px-5 py-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">interests</span>
                        {t('experiences', 'Experiences')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {activityTree.slice(0, 6).map((activity) => (
                          <Link
                            key={activity.id}
                            prefetch={false}
                            href={`${localePrefix}/tours/activity/${activity.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-[#f7941e] hover:text-[#f7941e] transition-colors"
                          >
                            {decodeHtmlEntities(activity.name)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Links */}
              <Link
                prefetch={false}
                href={localePrefix + '/about-us'}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-5 py-3.5 text-gray-800 font-medium hover:bg-gray-50 transition-colors border-t border-gray-100"
              >
                <span className="material-symbols-outlined text-[#f7941e]">info</span>
                {t('aboutUs', 'About Us')}
              </Link>

              <Link
                prefetch={false}
                href={localePrefix + '/contact'}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-5 py-3.5 text-gray-800 font-medium hover:bg-gray-50 transition-colors border-t border-gray-100"
              >
                <span className="material-symbols-outlined text-[#f7941e]">mail</span>
                {t('contactUs', 'Contact Us')}
              </Link>

              <Link
                prefetch={false}
                href={localePrefix + '/faq'}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-5 py-3.5 text-gray-800 font-medium hover:bg-gray-50 transition-colors border-t border-gray-100"
              >
                <span className="material-symbols-outlined text-[#f7941e]">help</span>
                {t('faq', 'FAQ')}
              </Link>
            </nav>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Language</span>
              <LanguageSwitcher currentLocale={lang} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
