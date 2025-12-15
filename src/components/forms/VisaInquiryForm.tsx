'use client';

import { useState } from 'react';
import { submitVisaInquiryForm, type VisaInquiryFormData, type CF7Response } from '@/lib/contact-form';
import styles from './Form.module.css';

const VISA_TYPES = [
    { value: 'Tourist Visa (L)', label: 'Tourist Visa (L)' },
    { value: 'Business Visa (M)', label: 'Business Visa (M)' },
    { value: 'Work Visa (Z)', label: 'Work Visa (Z)' },
    { value: 'Student Visa (X)', label: 'Student Visa (X)' },
    { value: 'Transit Visa (G)', label: 'Transit Visa (G)' },
    { value: 'Other', label: 'Other' },
];

interface VisaInquiryFormProps {
    className?: string;
    onSuccess?: () => void;
}

export default function VisaInquiryForm({ className, onSuccess }: VisaInquiryFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        nationality: '',
        visaType: VISA_TYPES[0].value,
        travelDate: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<CF7Response | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }
        if (!formData.nationality.trim()) {
            newErrors.nationality = 'Nationality is required';
        }
        if (!formData.visaType) {
            newErrors.visaType = 'Visa type is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setResult(null);

        try {
            const data: VisaInquiryFormData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                nationality: formData.nationality,
                visaType: formData.visaType,
                travelDate: formData.travelDate,
                message: formData.message,
            };

            const response = await submitVisaInquiryForm(data);
            setResult(response);

            if (response.status === 'mail_sent') {
                // Reset form on success
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    nationality: '',
                    visaType: VISA_TYPES[0].value,
                    travelDate: '',
                    message: '',
                });
                onSuccess?.();
            } else if (response.status === 'validation_failed' && response.invalid_fields) {
                // Map server-side validation errors
                const serverErrors: Record<string, string> = {};
                for (const field of response.invalid_fields) {
                    // Map CF7 field names to form field names
                    const fieldMap: Record<string, string> = {
                        'your-name': 'name',
                        'your-email': 'email',
                        'your-phone': 'phone',
                        'nationality': 'nationality',
                        'visa-type': 'visaType',
                        'travel-date': 'travelDate',
                        'your-message': 'message',
                    };
                    const fieldName = fieldMap[field.field] || field.field;
                    serverErrors[fieldName] = field.message;
                }
                setErrors(serverErrors);
            }
        } catch (error) {
            setResult({
                status: 'mail_failed',
                message: 'An unexpected error occurred. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`${styles.form} ${className || ''}`}>
            {result && (
                <div
                    className={`${styles.alert} ${result.status === 'mail_sent' ? styles.alertSuccess : styles.alertError
                        }`}
                >
                    {result.message}
                </div>
            )}

            <div className={styles.formGroup}>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name*"
                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    disabled={isSubmitting}
                />
                {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email*"
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    disabled={isSubmitting}
                />
                {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number*"
                    className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                    disabled={isSubmitting}
                />
                {errors.phone && <span className={styles.error}>{errors.phone}</span>}
            </div>

            <div className={styles.formGroup}>
                <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    placeholder="Nationality / Passport Country*"
                    className={`${styles.input} ${errors.nationality ? styles.inputError : ''}`}
                    disabled={isSubmitting}
                />
                {errors.nationality && <span className={styles.error}>{errors.nationality}</span>}
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Visa Type*</label>
                <select
                    name="visaType"
                    value={formData.visaType}
                    onChange={handleChange}
                    className={`${styles.select} ${errors.visaType ? styles.inputError : ''}`}
                    disabled={isSubmitting}
                >
                    {VISA_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
                {errors.visaType && <span className={styles.error}>{errors.visaType}</span>}
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Planned Travel Date</label>
                <input
                    type="date"
                    name="travelDate"
                    value={formData.travelDate}
                    onChange={handleChange}
                    className={styles.input}
                    disabled={isSubmitting}
                />
            </div>

            <div className={styles.formGroup}>
                <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Additional Details (Optional)"
                    rows={4}
                    className={styles.textarea}
                    disabled={isSubmitting}
                />
            </div>

            <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Visa Inquiry'}
            </button>
        </form>
    );
}
