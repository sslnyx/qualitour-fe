"use client";
import React, { useCallback, useRef, useState, useEffect } from "react";
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
  const [scrolled, setScrolled] = useState(false);
  const mouseOutDelay = 250;
  const mouseOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const servicesMouseOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track scroll for nav background effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const prefetchOnIntent = useCallback(
    (href: string) => {
      if (typeof window === 'undefined') return;
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
      icon: slug === 'attraction-tickets' ? 'confirmation_number' : slug === 'land-tours' ? 'hiking' : 'sailing',
    };
  });

  const destinationTree = buildTree<WPTourDestination>(organizeDestinations(destinations));
  const activityTree = buildTree<WPTourActivity>(activities);

  const handleMegamenuLinkClick = () => {
    setMegaOpen(false);
  };

  const serviceLinks = [
    {
      label: t('privateTransfers', 'Private Transfers'),
      href: `${localePrefix}/private-transfers`,
      icon: 'airport_shuttle',
      desc: 'Airport, cruise & ski transfers',
    },
    {
      label: t('chinaVisa', 'China Visa'),
      href: `${localePrefix}/visa`,
      icon: 'badge',
      desc: 'Visa application assistance',
    },
  ];

  const hotDestinations = [
    {
      label: lang === 'zh' ? '黄刀镇 (极光)' : 'Yellowknife (Aurora)',
      query: 'Yellowknife',
      icon: 'ac_unit'
    },
    {
      label: lang === 'zh' ? '白马市 (极光)' : 'Whitehorse (Aurora)',
      query: 'Whitehorse',
      icon: 'auto_awesome'
    },
    {
      label: lang === 'zh' ? '落基山脉' : 'Rocky Mountains',
      query: 'Rocky Mountains',
      icon: 'landscape'
    },
    {
      label: lang === 'zh' ? '海洋三省' : 'Maritimes',
      query: 'Maritimes',
      icon: 'sailing'
    }
  ];

  // Desktop nav link component with animated underline
  const NavLink = ({ href, children, isActive = false }: { href: string; children: React.ReactNode; isActive?: boolean }) => (
    <Link
      prefetch={false}
      href={href}
      className="relative px-4 py-2 text-gray-700 hover:text-[#f7941e] font-medium transition-colors group"
      {...intentPrefetchProps(href)}
    >
      {children}
      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#f7941e] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
    </Link>
  );

  // Dropdown trigger button component
  const DropdownTrigger = ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) => (
    <button className="relative px-4 py-2 text-gray-700 hover:text-[#f7941e] font-medium flex items-center gap-1 transition-colors group">
      {children}
      <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
        expand_more
      </span>
      <span className={`absolute bottom-0 left-4 right-4 h-0.5 bg-[#f7941e] transform transition-transform duration-300 origin-left rounded-full ${isOpen ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
    </button>
  );

  return (
    <nav
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-black/5'
        : 'bg-white border-b border-gray-100'
        }`}
    >
      <div className="container-qualitour">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <Link
            prefetch={false}
            href={localePrefix + '/'}
            className="flex items-center group"
            {...intentPrefetchProps(localePrefix + '/')}
          >
            <Image
              src={QualitourLogo}
              alt="Qualitour"
              width={175}
              height={48}
              className="w-[160px] lg:w-[175px] h-auto -ml-4 transition-transform duration-300 group-hover:scale-[1.02]"
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center">
            <li>
              <NavLink href={localePrefix + '/'}>{tc('home', 'Home')}</NavLink>
            </li>

            {/* Services Dropdown */}
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
              <DropdownTrigger isOpen={servicesOpen}>
                {t('services', 'Services')}
              </DropdownTrigger>

              {/* Services Dropdown Panel */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 top-full pt-2 transition-all duration-300 ${servicesOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}
              >
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden min-w-[320px]" style={{ boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15)' }}>
                  <div className="p-2">
                    {serviceLinks.map((item, idx) => (
                      <Link
                        key={item.href}
                        prefetch={false}
                        href={item.href}
                        className="flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all group"
                        {...intentPrefetchProps(item.href)}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f7941e] to-[#ff6b35] flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-200/50 group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-white text-xl">{item.icon}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 group-hover:text-[#f7941e] transition-colors block">{item.label}</span>
                          <span className="text-sm text-gray-500">{item.desc}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </li>

            {/* Tours Mega Menu */}
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
              <DropdownTrigger isOpen={megaOpen}>
                {t('tours', 'Tours')}
              </DropdownTrigger>

              {/* Mega Menu Panel */}
              <div
                className={`fixed left-0 right-0 top-[72px] z-[100] flex justify-center transition-all duration-300 ease-out ${megaOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
                  }`}
              >
                <div className="w-full max-w-6xl mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.2)' }}>
                  {/* Gradient Header */}
                  <div className="bg-gradient-to-r from-[#f7941e] via-[#ff8534] to-[#ff6b35] px-8 py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-2xl">explore</span>
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-xl">Discover Your Next Adventure</h3>
                          <p className="text-white/80 text-sm">Explore our curated tours across Canada and beyond</p>
                        </div>
                      </div>
                      <Link
                        prefetch={false}
                        href={localePrefix + '/tours'}
                        onClick={handleMegamenuLinkClick}
                        className="bg-white text-[#f7941e] px-6 py-3 rounded-full font-bold text-sm hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                        {...intentPrefetchProps(localePrefix + '/tours')}
                      >
                        <span>Browse All Tours</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="grid grid-cols-12 gap-8">
                      {/* Tour Types Column */}
                      <div className="col-span-3">
                        <h4 className="font-bold text-gray-900 text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#f7941e] text-lg">category</span>
                          </span>
                          {t('tourTypes', 'Tour Types')}
                        </h4>
                        <ul className="space-y-1">
                          {tourTypeLinks.map((link) => (
                            <li key={link.slug}>
                              <Link
                                prefetch={false}
                                href={localePrefix + `/tours/${link.type}/${link.slug}`}
                                onClick={handleMegamenuLinkClick}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:text-[#f7941e] transition-all group"
                                {...intentPrefetchProps(localePrefix + `/tours/${link.type}/${link.slug}`)}
                              >
                                <span className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-white group-hover:shadow-md flex items-center justify-center transition-all">
                                  <span className="material-symbols-outlined text-lg text-gray-500 group-hover:text-[#f7941e] transition-colors">
                                    {link.icon}
                                  </span>
                                </span>
                                <span className="font-medium">{link.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>

                        {/* Featured Tours Link */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <Link
                            prefetch={false}
                            href={localePrefix + '/tours/featured'}
                            onClick={handleMegamenuLinkClick}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 hover:from-amber-100 hover:to-yellow-100 transition-all group"
                            {...intentPrefetchProps(localePrefix + '/tours/featured')}
                          >
                            <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-200/50">
                              <span className="material-symbols-outlined text-white text-lg">star</span>
                            </span>
                            <div>
                              <span className="font-bold block">{t('featuredTours', 'Featured Tours')}</span>
                              <span className="text-xs text-amber-600/70">Our top picks</span>
                            </div>
                          </Link>
                        </div>
                      </div>

                      {/* Destinations Column */}
                      <div className="col-span-6 border-x border-gray-100 px-8">
                        <h4 className="font-bold text-gray-900 text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-600 text-lg">public</span>
                          </span>
                          {t('destinations', 'Popular Destinations')}
                        </h4>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                          {destinationTree.map((dest) => (
                            <div key={dest.id} className="group">
                              <Link
                                prefetch={false}
                                href={`${localePrefix}/tours/destination/${dest.slug}`}
                                onClick={handleMegamenuLinkClick}
                                className="flex items-center gap-3 font-semibold text-gray-800 hover:text-[#f7941e] transition-colors py-1"
                                {...intentPrefetchProps(`${localePrefix}/tours/destination/${dest.slug}`)}
                              >
                                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f7941e]/10 to-[#ff6b35]/10 flex items-center justify-center text-sm font-bold text-[#f7941e] group-hover:from-[#f7941e] group-hover:to-[#ff6b35] group-hover:text-white transition-all shadow-sm">
                                  {dest.name.charAt(0)}
                                </span>
                                <span>{decodeHtmlEntities(dest.name)}</span>
                                {dest.children.length > 0 && (
                                  <span className="material-symbols-outlined text-[14px] text-gray-400 group-hover:text-[#f7941e] group-hover:translate-x-1 transition-all">chevron_right</span>
                                )}
                              </Link>
                              {dest.children.length > 0 && (
                                <ul className="ml-11 mt-2 space-y-1">
                                  {dest.children.slice(0, 3).map((child) => (
                                    <li key={child.id}>
                                      <Link
                                        prefetch={false}
                                        href={`${localePrefix}/tours/destination/${child.slug}`}
                                        onClick={handleMegamenuLinkClick}
                                        className="text-sm text-gray-500 hover:text-[#f7941e] transition-colors block py-0.5 hover:translate-x-1 transform"
                                        {...intentPrefetchProps(`${localePrefix}/tours/destination/${child.slug}`)}
                                      >
                                        {decodeHtmlEntities(child.name)}
                                      </Link>
                                    </li>
                                  ))}
                                  {dest.children.length > 3 && (
                                    <li>
                                      <Link
                                        prefetch={false}
                                        href={`${localePrefix}/tours/destination/${dest.slug}`}
                                        onClick={handleMegamenuLinkClick}
                                        className="text-xs text-[#f7941e] font-semibold hover:underline py-0.5 inline-flex items-center gap-1"
                                        {...intentPrefetchProps(`${localePrefix}/tours/destination/${dest.slug}`)}
                                      >
                                        +{dest.children.length - 3} more
                                        <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                                      </Link>
                                    </li>
                                  )}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Hot Locations Column */}
                      <div className="col-span-3">
                        <h4 className="font-bold text-gray-900 text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-600 text-lg">whatshot</span>
                          </span>
                          {lang === 'zh' ? '热门目的地' : 'Hot Locations'}
                        </h4>
                        <div className="space-y-3">
                          {hotDestinations.map((dest, idx) => (
                            <Link
                              key={idx}
                              prefetch={false}
                              href={`${localePrefix}/tours?tour-search=${encodeURIComponent(dest.query)}`}
                              onClick={handleMegamenuLinkClick}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-red-50 transition-all group"
                              {...intentPrefetchProps(`${localePrefix}/tours?tour-search=${encodeURIComponent(dest.query)}`)}
                            >
                              <span className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-100 group-hover:border-red-200 flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined text-gray-500 group-hover:text-red-500 transition-colors">
                                  {dest.icon}
                                </span>
                              </span>
                              <span className="font-medium text-gray-700 group-hover:text-red-600 transition-colors">
                                {dest.label}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <li>
              <NavLink href={localePrefix + '/about-us'}>{t('aboutUs', 'About')}</NavLink>
            </li>
            <li>
              <NavLink href={localePrefix + '/contact'}>{t('contactUs', 'Contact')}</NavLink>
            </li>
            <li>
              <NavLink href={localePrefix + '/faq'}>{t('faq', 'FAQ')}</NavLink>
            </li>
          </ul>

          {/* Right Side: Language Switcher & CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher currentLocale={lang} />
            <Link
              prefetch={false}
              href={localePrefix + '/tours'}
              className="bg-gradient-to-r from-[#f7941e] to-[#ff6b35] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-orange-300/40 hover:scale-105 transition-all flex items-center gap-2"
              {...intentPrefetchProps(localePrefix + '/tours')}
            >
              <span className="material-symbols-outlined text-[18px]">explore</span>
              Explore Tours
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors -mr-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="sr-only">Open menu</span>
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-gray-700 rounded-full transform transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-full h-0.5 bg-gray-700 rounded-full transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`w-full h-0.5 bg-gray-700 rounded-full transform transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Premium Slide-in Drawer */}
      <div
        className={`fixed inset-0 z-[200] lg:hidden transition-all duration-300 ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
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
          className={`absolute right-0 top-0 bottom-0 w-[90%] max-w-md bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${mobileOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <Image
              src={QualitourLogo}
              alt="Qualitour"
              width={140}
              height={38}
              className="h-10 w-auto -ml-3"
            />
            <button
              onClick={() => setMobileOpen(false)}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors"
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
                className="flex items-center gap-4 px-6 py-4 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
              >
                <span className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#f7941e]">home</span>
                </span>
                {tc('home', 'Home')}
              </Link>

              {/* Services Accordion */}
              <div className="border-t border-gray-100">
                <button
                  onClick={() => setServicesMobileOpen(!servicesMobileOpen)}
                  className="flex items-center justify-between w-full px-6 py-4 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-600">support_agent</span>
                    </span>
                    {t('services', 'Services')}
                  </div>
                  <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${servicesMobileOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${servicesMobileOpen ? 'max-h-60' : 'max-h-0'}`}>
                  <div className="bg-gray-50 py-3 px-6 space-y-2">
                    {serviceLinks.map((item) => (
                      <Link
                        key={item.href}
                        prefetch={false}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white transition-colors"
                      >
                        <span className="w-9 h-9 rounded-lg bg-white shadow flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#f7941e] text-lg">{item.icon}</span>
                        </span>
                        <div>
                          <span className="font-medium text-gray-800 block">{item.label}</span>
                          <span className="text-xs text-gray-500">{item.desc}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tours Accordion */}
              <div className="border-t border-gray-100">
                <button
                  onClick={() => setMegaOpen(!megaOpen)}
                  className="flex items-center justify-between w-full px-6 py-4 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f7941e] to-[#ff6b35] flex items-center justify-center shadow-lg shadow-orange-200/50">
                      <span className="material-symbols-outlined text-white">explore</span>
                    </span>
                    {t('tours', 'Tours')}
                  </div>
                  <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${megaOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${megaOpen ? 'max-h-[2000px]' : 'max-h-0'}`}>
                  <div className="bg-gray-50">
                    {/* Browse All Tours CTA */}
                    <div className="p-4 bg-gradient-to-r from-[#f7941e] to-[#ff6b35]">
                      <Link
                        prefetch={false}
                        href={localePrefix + '/tours'}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center gap-2 bg-white text-[#f7941e] px-5 py-3 rounded-xl font-bold text-sm shadow-lg"
                      >
                        <span>Browse All Tours</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </Link>
                    </div>

                    {/* Tour Types */}
                    <div className="px-6 py-5 border-b border-gray-200">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">category</span>
                        {t('tourTypes', 'Tour Types')}
                      </h4>
                      <div className="space-y-2">
                        {tourTypeLinks.map((link) => (
                          <Link
                            key={link.slug}
                            prefetch={false}
                            href={localePrefix + `/tours/${link.type}/${link.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors"
                          >
                            <span className="w-9 h-9 rounded-lg bg-white shadow flex items-center justify-center">
                              <span className="material-symbols-outlined text-gray-500 text-lg">{link.icon}</span>
                            </span>
                            <span className="font-medium text-gray-700">{link.label}</span>
                          </Link>
                        ))}
                        <Link
                          prefetch={false}
                          href={localePrefix + '/tours/featured'}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200"
                        >
                          <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 shadow flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-lg">star</span>
                          </span>
                          <span className="font-bold text-amber-700">{t('featuredTours', 'Featured Tours')}</span>
                        </Link>
                      </div>
                    </div>

                    {/* Destinations */}
                    <div className="px-6 py-5 border-b border-gray-200">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">public</span>
                        {t('destinations', 'Destinations')}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {destinationTree.map((dest) => (
                          <Link
                            key={dest.id}
                            prefetch={false}
                            href={`${localePrefix}/tours/destination/${dest.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white transition-colors"
                          >
                            <span className="w-7 h-7 rounded-full bg-[#f7941e]/10 flex items-center justify-center text-xs font-bold text-[#f7941e]">
                              {dest.name.charAt(0)}
                            </span>
                            <span className="text-sm font-medium text-gray-700">{decodeHtmlEntities(dest.name)}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Hot Locations */}
                    <div className="px-6 py-5">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">whatshot</span>
                        {lang === 'zh' ? '热门目的地' : 'Hot Locations'}
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {hotDestinations.map((dest, idx) => (
                          <Link
                            key={idx}
                            prefetch={false}
                            href={`${localePrefix}/tours?tour-search=${encodeURIComponent(dest.query)}`}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors"
                          >
                            <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                              <span className="material-symbols-outlined text-lg">{dest.icon}</span>
                            </span>
                            <span className="text-sm font-medium text-gray-700">{dest.label}</span>
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
                className="flex items-center gap-4 px-6 py-4 text-gray-800 font-medium hover:bg-gray-50 transition-colors border-t border-gray-100"
              >
                <span className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600">info</span>
                </span>
                {t('aboutUs', 'About Us')}
              </Link>

              <Link
                prefetch={false}
                href={localePrefix + '/contact'}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-4 px-6 py-4 text-gray-800 font-medium hover:bg-gray-50 transition-colors border-t border-gray-100"
              >
                <span className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-600">mail</span>
                </span>
                {t('contactUs', 'Contact Us')}
              </Link>

              <Link
                prefetch={false}
                href={localePrefix + '/faq'}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-4 px-6 py-4 text-gray-800 font-medium hover:bg-gray-50 transition-colors border-t border-gray-100"
              >
                <span className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-cyan-600">help</span>
                </span>
                {t('faq', 'FAQ')}
              </Link>
            </nav>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 py-5 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Language</span>
              <LanguageSwitcher currentLocale={lang} />
            </div>
            <Link
              prefetch={false}
              href={localePrefix + '/tours'}
              onClick={() => setMobileOpen(false)}
              className="w-full bg-gradient-to-r from-[#f7941e] to-[#ff6b35] text-white py-3.5 rounded-xl font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-orange-200/50"
            >
              <span className="material-symbols-outlined text-[20px]">explore</span>
              Explore All Tours
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
