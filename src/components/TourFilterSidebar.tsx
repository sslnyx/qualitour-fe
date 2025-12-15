'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { WPTour, WPTourDestination, WPTourActivity } from '@/lib/wordpress';
import { TourCard } from './TourCard';
import Link from 'next/link';

interface TourFilterSidebarProps {
    tours: WPTour[];
    totalTours: number;
    currentPage: number;
    totalPages: number;
    destinations: WPTourDestination[];
    activities: WPTourActivity[];
    lang: string;
    // Active filters from URL
    activeSearch?: string;
    activeDestination?: WPTourDestination | null;
    activeActivity?: WPTourActivity | null;
    activeSort?: string;
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

export function TourFilterSidebar({
    tours,
    totalTours,
    currentPage,
    totalPages,
    destinations,
    activities,
    lang,
    activeSearch = '',
    activeDestination = null,
    activeActivity = null,
    activeSort = 'date',
}: TourFilterSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Local state for search input (updates on submit, not on every keystroke)
    const [searchInput, setSearchInput] = useState(activeSearch);

    // UI states
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [openSections, setOpenSections] = useState<Set<string>>(new Set(['destinations', 'activities']));

    // Build destination tree for hierarchical display
    const { topLevel: topLevelDestinations, parentMap: destinationChildren } = buildDestinationTree(destinations);

    // Helper to build URL with updated params
    const buildFilterUrl = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());

        for (const [key, value] of Object.entries(updates)) {
            if (value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        }

        // Reset to page 1 when filters change (except for page changes)
        if (!('page' in updates)) {
            params.delete('page');
        }

        const queryString = params.toString();
        return queryString ? `${pathname}?${queryString}` : pathname;
    }, [pathname, searchParams]);

    // Filter handlers - update URL to trigger server-side filtering
    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        router.push(buildFilterUrl({ search: searchInput || null }));
    }, [router, buildFilterUrl, searchInput]);

    const handleDestinationChange = useCallback((slug: string | null) => {
        router.push(buildFilterUrl({ destination: slug }));
        setIsMobileOpen(false);
    }, [router, buildFilterUrl]);

    const handleActivityChange = useCallback((slug: string | null) => {
        router.push(buildFilterUrl({ activity: slug }));
        setIsMobileOpen(false);
    }, [router, buildFilterUrl]);

    const handleSortChange = useCallback((sort: string) => {
        router.push(buildFilterUrl({ sort: sort === 'date' ? null : sort }));
    }, [router, buildFilterUrl]);

    const clearAllFilters = useCallback(() => {
        setSearchInput('');
        router.push(pathname);
        setIsMobileOpen(false);
    }, [router, pathname]);

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

    const hasActiveFilters = activeSearch || activeDestination || activeActivity;

    // Render destination with children
    const renderDestination = (dest: WPTourDestination, level: number = 0) => {
        const children = destinationChildren.get(dest.id) || [];
        const isSelected = activeDestination?.slug === dest.slug;

        return (
            <div key={dest.id}>
                <button
                    onClick={() => handleDestinationChange(isSelected ? null : dest.slug)}
                    className={`flex items-center gap-3 py-2 w-full text-left hover:text-[#f7941e] transition-colors ${level > 0 ? 'ml-5' : ''}`}
                >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-[#f7941e] border-[#f7941e]' : 'border-gray-300'
                        }`}>
                        {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                            </svg>
                        )}
                    </span>
                    <span className={`flex-1 text-sm ${isSelected ? 'text-[#f7941e] font-medium' : 'text-gray-700'}`}>
                        {dest.name}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {dest.count || 0}
                    </span>
                </button>
                {children.length > 0 && (
                    <div className="border-l-2 border-gray-100 ml-2">
                        {children.map((child) => renderDestination(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    // Filter sidebar content
    const filterSidebarContent = (
        <div className="space-y-6">
            {/* Search */}
            <form onSubmit={handleSearch}>
                <div className="relative">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
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
                    {searchInput && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchInput('');
                                router.push(buildFilterUrl({ search: null }));
                            }}
                            className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f7941e] hover:text-[#d67a1a]"
                    >
                        <span className="material-icons text-xl">search</span>
                    </button>
                </div>
            </form>

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
                        {activeSearch && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-gray-200">
                                Search: {activeSearch}
                                <button onClick={() => {
                                    setSearchInput('');
                                    router.push(buildFilterUrl({ search: null }));
                                }} className="text-gray-400 hover:text-gray-600">×</button>
                            </span>
                        )}
                        {activeDestination && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-gray-200">
                                {activeDestination.name}
                                <button onClick={() => handleDestinationChange(null)} className="text-gray-400 hover:text-gray-600">×</button>
                            </span>
                        )}
                        {activeActivity && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-gray-200">
                                {activeActivity.name}
                                <button onClick={() => handleActivityChange(null)} className="text-gray-400 hover:text-gray-600">×</button>
                            </span>
                        )}
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
            <div className="pb-4">
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
                            const isSelected = activeActivity?.slug === act.slug;
                            return (
                                <button
                                    key={act.id}
                                    onClick={() => handleActivityChange(isSelected ? null : act.slug)}
                                    className="flex items-center gap-3 py-2 w-full text-left hover:text-[#f7941e] transition-colors"
                                >
                                    <span className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-[#f7941e] border-[#f7941e]' : 'border-gray-300'
                                        }`}>
                                        {isSelected && (
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                            </svg>
                                        )}
                                    </span>
                                    <span className={`flex-1 text-sm ${isSelected ? 'text-[#f7941e] font-medium' : 'text-gray-700'}`}>
                                        {act.name}
                                    </span>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {act.count || 0}
                                    </span>
                                </button>
                            );
                        })}
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
                                {hasActiveFilters ? (
                                    <>
                                        Found <span className="font-semibold text-[#f7941e]">{totalTours}</span> matching tours
                                        {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
                                    </>
                                ) : (
                                    <>
                                        Showing {tours.length} of <span className="font-semibold text-[#f7941e]">{totalTours}</span> tours
                                        {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
                                    </>
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
                                        {(activeDestination ? 1 : 0) + (activeActivity ? 1 : 0) + (activeSearch ? 1 : 0)}
                                    </span>
                                )}
                            </button>

                            {/* Sort dropdown */}
                            <select
                                value={activeSort}
                                onChange={(e) => handleSortChange(e.target.value)}
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
                                        Show {totalTours} Tours
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tours Grid */}
                    <main className="flex-1">
                        {tours.length === 0 ? (
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
                                {tours.map((tour) => (
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center">
                                <nav className="flex items-center gap-2">
                                    {/* Previous Button */}
                                    <Link
                                        href={currentPage > 1 ? buildFilterUrl({ page: String(currentPage - 1) }) : '#'}
                                        className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-1 ${currentPage > 1
                                                ? 'border-gray-200 hover:border-[#f7941e] hover:text-[#f7941e] bg-white'
                                                : 'border-gray-100 text-gray-300 bg-gray-50 pointer-events-none'
                                            }`}
                                        aria-disabled={currentPage <= 1}
                                    >
                                        <span className="material-icons text-sm">chevron_left</span>
                                        Prev
                                    </Link>

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <Link
                                                    key={pageNum}
                                                    href={buildFilterUrl({ page: String(pageNum) })}
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-all ${pageNum === currentPage
                                                            ? 'bg-[#f7941e] text-white shadow-lg shadow-orange-200'
                                                            : 'bg-white border border-gray-200 hover:border-[#f7941e] hover:text-[#f7941e]'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </Link>
                                            );
                                        })}
                                        {totalPages > 5 && currentPage < totalPages - 2 && (
                                            <>
                                                <span className="px-2 text-gray-400">...</span>
                                                <Link
                                                    href={buildFilterUrl({ page: String(totalPages) })}
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center font-medium bg-white border border-gray-200 hover:border-[#f7941e] hover:text-[#f7941e] transition-all"
                                                >
                                                    {totalPages}
                                                </Link>
                                            </>
                                        )}
                                    </div>

                                    {/* Next Button */}
                                    <Link
                                        href={currentPage < totalPages ? buildFilterUrl({ page: String(currentPage + 1) }) : '#'}
                                        className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-1 ${currentPage < totalPages
                                                ? 'border-gray-200 hover:border-[#f7941e] hover:text-[#f7941e] bg-white'
                                                : 'border-gray-100 text-gray-300 bg-gray-50 pointer-events-none'
                                            }`}
                                        aria-disabled={currentPage >= totalPages}
                                    >
                                        Next
                                        <span className="material-icons text-sm">chevron_right</span>
                                    </Link>
                                </nav>
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
