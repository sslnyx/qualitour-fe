'use client';

import { useState } from 'react';
import { TourInquiryForm } from '@/components/forms';

interface TourSidebarFormProps {
    tourId: number | string;
    tourTitle: string;
    price?: string | number;
    duration?: string;
    groupSize?: string;
    datesDetail?: string;
    tourCodeDetail?: string;
    categories?: Array<{ id: number; name: string }>;
    pdfUrl?: string;
}

export default function TourSidebarForm({
    tourId,
    tourTitle,
    price,
    duration,
    groupSize,
    datesDetail,
    tourCodeDetail,
    categories = [],
    pdfUrl,
}: TourSidebarFormProps) {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
            {/* Price */}
            {price && (
                <div className="text-center mb-6 pb-6">
                    <div className="text-sm text-gray-600 mb-1">Starting from</div>
                    <div className="text-4xl font-bold text-[#f7941e]">${price}</div>
                    <div className="text-sm text-gray-500">per person</div>
                </div>
            )}

            {/* Tour Details */}
            <div className="space-y-4">
                {duration && (
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <div className="text-sm text-gray-600">Duration</div>
                            <div className="font-semibold text-gray-900">{duration}</div>
                        </div>
                    </div>
                )}

                {groupSize && (
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <div>
                            <div className="text-sm text-gray-600">Group Size</div>
                            <div className="font-semibold text-gray-900">{groupSize}</div>
                        </div>
                    </div>
                )}

                {datesDetail && (
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                            <div className="text-sm text-gray-600">Availability</div>
                            <div className="font-semibold text-gray-900">{datesDetail}</div>
                        </div>
                    </div>
                )}

                {tourCodeDetail && (
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        <div>
                            <div className="text-sm text-gray-600">Reference</div>
                            <div className="font-semibold text-gray-900 font-mono text-sm">{tourCodeDetail}</div>
                        </div>
                    </div>
                )}

                {/* Categories */}
                {categories.length > 0 && (
                    <div className="flex items-start gap-3 pt-4 border-t">
                        <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <div className="flex-1">
                            <div className="text-sm text-gray-600 mb-2">Categories</div>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <span
                                        key={category.id}
                                        className="px-2 py-1 bg-orange-50 text-[#f7941e] text-xs rounded-full"
                                    >
                                        {category.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ACF PDF File Field */}
                {pdfUrl && (
                    <div className="flex items-start gap-3 pt-4 border-t">
                        <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16V4H4zm2 2h12v12H6V6zm2 2v8h8V8H8z" />
                        </svg>
                        <div className="flex-1">
                            <div className="text-sm text-gray-600 mb-2">Download PDF</div>
                            <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:underline"
                            >
                                Download PDF
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* CTA Button or Form */}
            <div className="mt-6 pt-6 border-t">
                {!showForm ? (
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full bg-[#f7941e] hover:bg-[#d67a1a] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Inquire Now
                    </button>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Send Inquiry</h3>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-gray-400 hover:text-gray-600"
                                aria-label="Close form"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <TourInquiryForm
                            tourId={tourId}
                            tourCode={tourCodeDetail}
                            tourTitle={tourTitle}
                            onSuccess={() => {
                                // Keep form visible to show success message
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
