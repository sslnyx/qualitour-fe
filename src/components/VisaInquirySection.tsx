'use client';

import { VisaInquiryForm } from '@/components/forms';

interface VisaInquirySectionProps {
    lang: 'en' | 'zh';
}

export default function VisaInquirySection({ lang }: VisaInquirySectionProps) {
    const title = lang === 'zh' ? '立即咨询' : 'Start Your Inquiry';
    const subtitle =
        lang === 'zh'
            ? '填写以下表格，我们将在1个工作日内与您联系。'
            : "Fill out the form below and we'll get back to you within 1 business day.";

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12">
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-[#f7941e]/10 rounded-full px-4 py-2 mb-4">
                    <span className="material-icons text-[#f7941e] text-sm">contact_support</span>
                    <span className="text-[#f7941e] font-semibold text-sm tracking-wide uppercase">
                        {lang === 'zh' ? '联系我们' : 'Contact Us'}
                    </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-text-heading mb-3">
                    {title}
                </h2>
                <p className="text-text-muted leading-relaxed">{subtitle}</p>
            </div>
            <VisaInquiryForm className="max-w-lg mx-auto" />
        </div>
    );
}
