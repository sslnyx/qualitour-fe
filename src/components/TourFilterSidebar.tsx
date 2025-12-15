'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { WPTour, WPTourDestination, WPTourActivity } from '@/lib/wordpress';
import { TourCard } from './TourCard';

interface TourFilterSidebarProps {
    tours: WPTour[];
    destinations: WPTourDestination[];
    activities: WPTourActivity[];
    lang: string;
}

// Build destination hierarchy for nested display
function buildDestinationTree(destinations: WPTourDestination[]) {
    const parentMap = new Map<number, WPTourDestination[]>();
    const topLevel: WPTourDestination[] = [];

    destinations.forEach((dest) => {
        if (dest.parent === 0) {
            topLevel.push(dest);
        } else {
            const children = parentMap.get(dest.parent) || [];
            children.push(dest);
            parentMap.set(dest.parent, children);
        }
    });

    return { topLevel, parentMap };
}

// Parse price from tour meta
function getTourPrice(tour: WPTour): number | null {
    const meta = tour.tour_meta;
    if (!meta) return null;

    // Try discount price first, then regular price
    const priceStr = meta['tour-price-discount-text'] || meta['tour-price-text'] || meta.price;
    if (!priceStr) return null;

    // Extract numeric value from price string (e.g., "From $1,299" -> 1299)
    const match = String(priceStr).replace(/,/g, '').match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
}

// Get duration in days from tour meta
function getTourDuration(tour: WPTour): number | null {
    const meta = tour.tour_meta;
    if (!meta) return null;

    const durationStr = meta.duration || meta.duration_text || '';
    const match = String(durationStr).match(/(\d+)/);
    return match ? parseInt(match[0], 10) : null;
}

export function TourFilterSidebar({
    tours,
    destinations,
    activities,
    lang,
}: TourFilterSidebarProps) {
    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDestinations, setSelectedDestinations] = useState<Set<string>>(new Set());
    const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    const [durationRange, setDurationRange] = useState<[number, number]>([0, 30]);
    const [sortBy, setSortBy] = useState<'date' | 'price-asc' | 'price-desc' | 'name'>('date');

    // UI states
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [openSections, setOpenSections] = useState<Set<string>>(new Set(['destinations', 'activities']));

    // Calculate price and duration ranges from tours data
    const { minPrice, maxPrice, minDuration, maxDuration } = useMemo(() => {
        let minP = Infinity, maxP = 0, minD = Infinity, maxD = 0;

        tours.forEach((tour) => {
            const price = getTourPrice(tour);
            const duration = getTourDuration(tour);

            if (price !== null) {
                minP = Math.min(minP, price);
                maxP = Math.max(maxP, price);
            }
            if (duration !== null) {
                minD = Math.min(minD, duration);
                maxD = Math.max(maxD, duration);
            }
        });

        return {
            minPrice: minP === Infinity ? 0 : minP,
            maxPrice: maxP === 0 ? 10000 : maxP,
            minDuration: minD === Infinity ? 1 : minD,
            maxDuration: maxD === 0 ? 30 : maxD,
        };
    }, [tours]);

    // Initialize ranges
    useEffect(() => {
        setPriceRange([minPrice, maxPrice]);
        setDurationRange([minDuration, maxDuration]);
    }, [minPrice, maxPrice, minDuration, maxDuration]);

    // Build destination tree for hierarchical display
    const { topLevel: topLevelDestinations, parentMap: destinationChildren } = useMemo(
        () => buildDestinationTree(destinations),
        [destinations]
    );

    // Filter tours based on all criteria
    const filteredTours = useMemo(() => {
        let result = tours.filter((tour) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const title = tour.title.rendered.toLowerCase();
                const excerpt = tour.excerpt?.rendered?.toLowerCase() || '';
                if (!title.includes(query) && !excerpt.includes(query)) {
                    return false;
                }
            }

            // Destination filter
            if (selectedDestinations.size > 0) {
                const tourDests = tour.tour_terms?.destinations || [];
                const hasMatch = tourDests.some((d) => selectedDestinations.has(d.slug));
                if (!hasMatch) return false;
            }

            // Activity filter
            if (selectedActivities.size > 0) {
                const tourActs = tour.tour_terms?.activities || [];
                const hasMatch = tourActs.some((a) => selectedActivities.has(a.slug));
                if (!hasMatch) return false;
            }

            // Price filter
            const price = getTourPrice(tour);
            if (price !== null && (price < priceRange[0] || price > priceRange[1])) {
                return false;
            }

            // Duration filter
            const duration = getTourDuration(tour);
            if (duration !== null && (duration < durationRange[0] || duration > durationRange[1])) {
                return false;
            }

            return true;
        });

        // Sort results
        result.sort((a, b) => {
            switch (sortBy) {
                case 'price-asc': {
                    const priceA = getTourPrice(a) ?? Infinity;
                    const priceB = getTourPrice(b) ?? Infinity;
                    return priceA - priceB;
                }
                case 'price-desc': {
                    const priceA = getTourPrice(a) ?? 0;
                    const priceB = getTourPrice(b) ?? 0;
                    return priceB - priceA;
                }
                case 'name':
                    return a.title.rendered.localeCompare(b.title.rendered);
                case 'date':
                default:
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
        });

        return result;
    }, [tours, searchQuery, selectedDestinations, selectedActivities, priceRange, durationRange, sortBy]);

    // Toggle functions
    const toggleSection = useCallback((sectionId: string) => {
        setOpenSections((prev) => {
            const next = new Set(prev);
            if (next.has(sectionId)) {
                next.delete(sectionId);
            } else {
                next.add(sectionId);
            }
            return next;
        });
    }, []);

    const toggleDestination = useCallback((slug: string) => {
        setSelectedDestinations((prev) => {
            const next = new Set(prev);
            if (next.has(slug)) {
                next.delete(slug);
            } else {
                next.add(slug);
            }
            return next;
        });
    }, []);

    const toggleActivity = useCallback((slug: string) => {
        setSelectedActivities((prev) => {
            const next = new Set(prev);
            if (next.has(slug)) {
                next.delete(slug);
            } else {
                next.add(slug);
            }
            return next;
        });
    }, []);

    const clearAllFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedDestinations(new Set());
        setSelectedActivities(new Set());
        setPriceRange([minPrice, maxPrice]);
        setDurationRange([minDuration, maxDuration]);
        setSortBy('date');
    }, [minPrice, maxPrice, minDuration, maxDuration]);

    const hasActiveFilters = searchQuery || selectedDestinations.size > 0 || selectedActivities.size > 0 ||
        priceRange[0] > minPrice || priceRange[1] < maxPrice ||
        durationRange[0] > minDuration || durationRange[1] < maxDuration;

    // Count tours per destination/activity for the sidebar
    const destinationCounts = useMemo(() => {
        const counts = new Map<string, number>();
        tours.forEach((tour) => {
            tour.tour_terms?.destinations?.forEach((d) => {
                counts.set(d.slug, (counts.get(d.slug) || 0) + 1);
            });
        });
        return counts;
    }, [tours]);

    const activityCounts = useMemo(() => {
        const counts = new Map<string, number>();
        tours.forEach((tour) => {
            tour.tour_terms?.activities?.forEach((a) => {
                counts.set(a.slug, (counts.get(a.slug) || 0) + 1);
            });
        });
        return counts;
    }, [tours]);

    // Render destination with children - using regular function, not component
    const renderDestination = (dest: WPTourDestination, level: number = 0) => {
        const children = destinationChildren.get(dest.id) || [];
        const count = destinationCounts.get(dest.slug) || 0;
        const isSelected = selectedDestinations.has(dest.slug);

        return (
            <div key={dest.id}>
                <label
                    className={`flex items-center gap-3 py-2 cursor-pointer hover:text-[#f7941e] transition-colors ${level > 0 ? 'ml-5' : ''
                        }`}
                >
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleDestination(dest.slug)}
                        className="w-4 h-4 rounded border-gray-300 text-[#f7941e] focus:ring-[#f7941e]"
                    />
                    <span className={`flex-1 text-sm ${isSelected ? 'text-[#f7941e] font-medium' : 'text-gray-700'}`}>
                        {dest.name}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {count}
                    </span>
                </label>
                {children.length > 0 && (
                    <div className="border-l-2 border-gray-100 ml-2">
                        {children.map((child) => renderDestination(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    // Filter sidebar content as JSX (not a component to preserve input focus)
    const filterSidebarContent = (
        <div className="space-y-6">
            {/* Search */}
            <div>
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tours..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f7941e]/20 focus:border-[#f7941e] transition-all bg-gray-50/50"
                    />
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div className="p-3 bg-[#f7941e]/5 rounded-xl border border-[#f7941e]/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Active Filters</span>
                        <button
                            onClick={clearAllFilters}
                            className="text-xs text-[#f7941e] hover:text-[#d67a1a] font-medium"
                        >
                            Clear All
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {searchQuery && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-gray-200">
                                Search: {searchQuery}
                                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">×</button>
                            </span>
                        )}
                        {Array.from(selectedDestinations).map((slug) => {
                            const dest = destinations.find((d) => d.slug === slug);
                            return (
                                <span key={slug} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-gray-200">
                                    {dest?.name || slug}
                                    <button onClick={() => toggleDestination(slug)} className="text-gray-400 hover:text-gray-600">×</button>
                                </span>
                            );
                        })}
                        {Array.from(selectedActivities).map((slug) => {
                            const act = activities.find((a) => a.slug === slug);
                            return (
                                <span key={slug} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-gray-200">
                                    {act?.name || slug}
                                    <button onClick={() => toggleActivity(slug)} className="text-gray-400 hover:text-gray-600">×</button>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Destinations Section */}
            <div className="border-b border-gray-100 pb-4">
                <button
                    onClick={() => toggleSection('destinations')}
                    className="flex items-center justify-between w-full py-2 text-left"
                >
                    <span className="font-semibold text-gray-900">Destinations</span>
                    <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${openSections.has('destinations') ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {openSections.has('destinations') && (
                    <div className="mt-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {topLevelDestinations.map((dest) => renderDestination(dest))}
                    </div>
                )}
            </div>

            {/* Activities Section */}
            <div className="border-b border-gray-100 pb-4">
                <button
                    onClick={() => toggleSection('activities')}
                    className="flex items-center justify-between w-full py-2 text-left"
                >
                    <span className="font-semibold text-gray-900">Activities</span>
                    <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${openSections.has('activities') ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {openSections.has('activities') && (
                    <div className="mt-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {activities.map((act) => {
                            const count = activityCounts.get(act.slug) || 0;
                            const isSelected = selectedActivities.has(act.slug);
                            return (
                                <label
                                    key={act.id}
                                    className="flex items-center gap-3 py-2 cursor-pointer hover:text-[#f7941e] transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleActivity(act.slug)}
                                        className="w-4 h-4 rounded border-gray-300 text-[#f7941e] focus:ring-[#f7941e]"
                                    />
                                    <span className={`flex-1 text-sm ${isSelected ? 'text-[#f7941e] font-medium' : 'text-gray-700'}`}>
                                        {act.name}
                                    </span>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {count}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Price Range Section */}
            <div className="border-b border-gray-100 pb-4">
                <button
                    onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full py-2 text-left"
                >
                    <span className="font-semibold text-gray-900">Price Range</span>
                    <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${openSections.has('price') ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {openSections.has('price') && (
                    <div className="mt-4 px-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>${priceRange[0].toLocaleString()}</span>
                            <span>${priceRange[1].toLocaleString()}</span>
                        </div>
                        <div className="relative">
                            <input
                                type="range"
                                min={minPrice}
                                max={maxPrice}
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([Math.min(parseInt(e.target.value), priceRange[1] - 100), priceRange[1]])}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#f7941e]"
                            />
                            <input
                                type="range"
                                min={minPrice}
                                max={maxPrice}
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], Math.max(parseInt(e.target.value), priceRange[0] + 100)])}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#f7941e] -mt-2"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Duration Section */}
            <div className="pb-4">
                <button
                    onClick={() => toggleSection('duration')}
                    className="flex items-center justify-between w-full py-2 text-left"
                >
                    <span className="font-semibold text-gray-900">Duration</span>
                    <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${openSections.has('duration') ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {openSections.has('duration') && (
                    <div className="mt-4 px-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{durationRange[0]} {durationRange[0] === 1 ? 'day' : 'days'}</span>
                            <span>{durationRange[1]} days</span>
                        </div>
                        <input
                            type="range"
                            min={minDuration}
                            max={maxDuration}
                            value={durationRange[1]}
                            onChange={(e) => setDurationRange([durationRange[0], parseInt(e.target.value)])}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#f7941e]"
                        />
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with sort */}
            <div className="bg-white border-b sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Our Tours</h1>
                            <p className="text-gray-600 mt-1">
                                {filteredTours.length} {filteredTours.length === 1 ? 'tour' : 'tours'} found
                                {tours.length !== filteredTours.length && (
                                    <span className="text-gray-400"> (of {tours.length} total)</span>
                                )}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Mobile filter toggle */}
                            <button
                                onClick={() => setIsMobileOpen(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filters
                                {hasActiveFilters && (
                                    <span className="bg-[#f7941e] text-white text-xs px-2 py-0.5 rounded-full">
                                        {selectedDestinations.size + selectedActivities.size + (searchQuery ? 1 : 0)}
                                    </span>
                                )}
                            </button>

                            {/* Sort dropdown */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f7941e]/20 focus:border-[#f7941e] bg-white"
                            >
                                <option value="date">Newest First</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="name">Name: A-Z</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-72 flex-shrink-0">
                        <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#f7941e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filters
                            </h2>
                            {filterSidebarContent}
                        </div>
                    </aside>

                    {/* Mobile Sidebar Overlay */}
                    {isMobileOpen && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            <div
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                onClick={() => setIsMobileOpen(false)}
                            />
                            <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
                                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                                    <h2 className="font-bold text-lg text-gray-900">Filters</h2>
                                    <button
                                        onClick={() => setIsMobileOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-6">
                                    {filterSidebarContent}
                                </div>
                                <div className="sticky bottom-0 bg-white border-t p-4">
                                    <button
                                        onClick={() => setIsMobileOpen(false)}
                                        className="w-full py-3 bg-[#f7941e] text-white font-semibold rounded-xl hover:bg-[#d67a1a] transition-colors"
                                    >
                                        Show {filteredTours.length} Tours
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tours Grid */}
                    <main className="flex-1">
                        {filteredTours.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tours found</h3>
                                <p className="text-gray-600 mb-6">Try adjusting your filters to find more tours</p>
                                <button
                                    onClick={clearAllFilters}
                                    className="px-6 py-2 bg-[#f7941e] text-white font-medium rounded-lg hover:bg-[#d67a1a] transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredTours.map((tour) => (
                                    <TourCard
                                        key={tour.id}
                                        tour={tour}
                                        lang={lang}
                                        style="grid-with-frame"
                                        showRating={true}
                                        showInfo={['duration-text']}
                                        excerptWords={14}
                                        imageSize="large"
                                    />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Custom scrollbar styles */}
            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
        </div>
    );
}
