'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'default' | 'circular' | 'rounded';
    animation?: 'pulse' | 'shimmer' | 'wave';
}

/**
 * Premium Skeleton component with shimmer animation
 */
export function Skeleton({
    className,
    variant = 'default',
    animation = 'shimmer',
}: SkeletonProps) {
    const baseClasses = 'bg-gray-200 relative overflow-hidden';

    const variantClasses = {
        default: 'rounded',
        circular: 'rounded-full',
        rounded: 'rounded-xl',
    };

    const animationClasses = {
        pulse: 'animate-pulse',
        shimmer: 'skeleton-shimmer',
        wave: 'skeleton-wave',
    };

    return (
        <div
            className={cn(
                baseClasses,
                variantClasses[variant],
                animationClasses[animation],
                className
            )}
        />
    );
}

/**
 * Premium Tour Card skeleton
 */
export function TourCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Image placeholder */}
            <div className="relative">
                <Skeleton className="h-52 w-full rounded-none" />
                {/* Badge placeholder */}
                <div className="absolute top-4 left-4">
                    <Skeleton className="h-6 w-20 rounded-full" variant="rounded" />
                </div>
                {/* Heart icon placeholder */}
                <div className="absolute top-4 right-4">
                    <Skeleton className="h-8 w-8" variant="circular" />
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Title */}
                <Skeleton className="h-6 w-4/5 mb-3" />

                {/* Meta info */}
                <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" variant="circular" />
                    <Skeleton className="h-4 w-20" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-4 w-4" variant="circular" />
                        ))}
                    </div>
                    <Skeleton className="h-4 w-12" />
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <Skeleton className="h-3 w-12 mb-1" />
                        <Skeleton className="h-7 w-24" />
                    </div>
                    <Skeleton className="h-10 w-28 rounded-lg" variant="rounded" />
                </div>
            </div>
        </div>
    );
}

/**
 * Tour Detail Hero skeleton
 */
export function TourHeroSkeleton() {
    return (
        <div className="relative h-[60vh] min-h-[400px] bg-gradient-to-br from-gray-200 to-gray-300">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="container-qualitour">
                    {/* Breadcrumb */}
                    <Skeleton className="h-4 w-48 mb-4 bg-white/30" />

                    {/* Title */}
                    <Skeleton className="h-12 w-3/4 mb-4 bg-white/30" />

                    {/* Meta */}
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-32 bg-white/30" variant="rounded" />
                        <Skeleton className="h-6 w-24 bg-white/30" variant="rounded" />
                        <Skeleton className="h-6 w-28 bg-white/30" variant="rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Tour Detail Content skeleton
 */
export function TourContentSkeleton() {
    return (
        <div className="container-qualitour py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Section 1 */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <Skeleton className="h-8 w-48 mb-6" />
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-11/12" />
                            <Skeleton className="h-4 w-10/12" />
                            <Skeleton className="h-4 w-9/12" />
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <Skeleton className="h-6 w-32 mb-4" />
                            <div className="grid grid-cols-2 gap-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10" variant="circular" />
                                        <Skeleton className="h-4 flex-1" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 2 - Itinerary */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <Skeleton className="h-8 w-40 mb-6" />
                        <div className="space-y-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-12 w-12 flex-shrink-0" variant="circular" />
                                    <div className="flex-1">
                                        <Skeleton className="h-5 w-48 mb-2" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4 mt-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-24">
                        {/* Price */}
                        <div className="text-center pb-6 border-b border-gray-100">
                            <Skeleton className="h-4 w-20 mx-auto mb-2" />
                            <Skeleton className="h-10 w-32 mx-auto" />
                        </div>

                        {/* Booking form */}
                        <div className="py-6 space-y-4">
                            <Skeleton className="h-14 w-full" variant="rounded" />
                            <Skeleton className="h-14 w-full" variant="rounded" />
                            <Skeleton className="h-14 w-full" variant="rounded" />
                        </div>

                        {/* CTA */}
                        <Skeleton className="h-12 w-full" variant="rounded" />

                        {/* Trust badges */}
                        <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center gap-4">
                            <Skeleton className="h-8 w-8" variant="circular" />
                            <Skeleton className="h-8 w-8" variant="circular" />
                            <Skeleton className="h-8 w-8" variant="circular" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Page Header skeleton
 */
export function PageHeaderSkeleton() {
    return (
        <div className="bg-white py-12 border-b border-gray-100">
            <div className="container-qualitour">
                <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-4" variant="circular" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-12 w-80 mb-3" />
                <Skeleton className="h-5 w-96" />
            </div>
        </div>
    );
}

/**
 * Filter Bar skeleton
 */
export function FilterBarSkeleton() {
    return (
        <div className="bg-white border-b border-gray-100 sticky top-[72px] z-40">
            <div className="container-qualitour py-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-28" variant="rounded" />
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-32" variant="rounded" />
                        <Skeleton className="h-10 w-10" variant="rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Premium loading spinner
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className={cn('relative', sizeClasses[size])}>
            <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-2 border-[#f7941e] border-t-transparent animate-spin" />
        </div>
    );
}

/**
 * Full page loading state
 */
export function FullPageLoader() {
    return (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                    <div className="absolute inset-0 rounded-full border-4 border-[#f7941e] border-t-transparent animate-spin" />
                </div>
                <p className="text-gray-500 font-medium">Loading...</p>
            </div>
        </div>
    );
}
