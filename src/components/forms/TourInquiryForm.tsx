'use client';

import { useState } from 'react';
import { submitTourInquiryForm, type TourInquiryFormData, type CF7Response } from '@/lib/contact-form';
import styles from './Form.module.css';

interface TourInquiryFormProps {
    tourId: string | number;
    tourTitle: string;
    className?: string;
    onSuccess?: () => void;
}

export default function TourInquiryForm({
    tourId,
    tourTitle,
    className,
    onSuccess,
}: TourInquiryFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        travelDate: '',
        numTravelers: 2,
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
        if (!formData.travelDate) {
            newErrors.travelDate = 'Travel date is required';
        }
        if (formData.numTravelers < 1) {
            newErrors.numTravelers = 'At least 1 traveler is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
        }));
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
            const data: TourInquiryFormData = {
                tourId: String(tourId),
                tourTitle,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                travelDate: formData.travelDate,
                numTravelers: formData.numTravelers,
                message: formData.message,
            };

            const response = await submitTourInquiryForm(data);
            setResult(response);

            if (response.status === 'mail_sent') {
                // Reset form on success
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    travelDate: '',
                    numTravelers: 2,
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
                        'travel-date': 'travelDate',
                        'num-travelers': 'numTravelers',
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

    // Get today's date in YYYY-MM-DD format for min date
    const today = new Date().toISOString().split('T')[0];

    return (
        <form onSubmit={handleSubmit} className={`${styles.form} ${className || ''}`}>
            {/* Hidden tour info */}
            <div className={styles.tourInfo}>
                <span className={styles.tourInfoLabel}>Inquiring about:</span>
                <span className={styles.tourInfoValue}>{tourTitle}</span>
            </div>

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

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Travel Date*</label>
                    <input
                        type="date"
                        name="travelDate"
                        value={formData.travelDate}
                        onChange={handleChange}
                        min={today}
                        className={`${styles.input} ${errors.travelDate ? styles.inputError : ''}`}
                        disabled={isSubmitting}
                    />
                    {errors.travelDate && <span className={styles.error}>{errors.travelDate}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Travelers*</label>
                    <input
                        type="number"
                        name="numTravelers"
                        value={formData.numTravelers}
                        onChange={handleChange}
                        min={1}
                        max={50}
                        className={`${styles.input} ${errors.numTravelers ? styles.inputError : ''}`}
                        disabled={isSubmitting}
                    />
                    {errors.numTravelers && <span className={styles.error}>{errors.numTravelers}</span>}
                </div>
            </div>

            <div className={styles.formGroup}>
                <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Message (Optional)"
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
                {isSubmitting ? 'Sending Inquiry...' : 'Submit Inquiry'}
            </button>
        </form>
    );
}
