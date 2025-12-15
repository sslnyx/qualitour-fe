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
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-text-heading mb-2 text-center">
                {title}
            </h2>
            <p className="text-text-muted text-center mb-8">{subtitle}</p>
            <VisaInquiryForm className="max-w-lg mx-auto" />
        </div>
    );
}
