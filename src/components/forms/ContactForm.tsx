'use client';

import { useState } from 'react';
import { submitContactForm, type ContactFormData, type CF7Response } from '@/lib/contact-form';
import styles from './Form.module.css';

interface ContactFormProps {
    className?: string;
}

export default function ContactForm({ className }: ContactFormProps) {
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        subject: '',
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
        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        }
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
            const response = await submitContactForm(formData);
            setResult(response);

            if (response.status === 'mail_sent') {
                // Reset form on success
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: '',
                });
            } else if (response.status === 'validation_failed' && response.invalid_fields) {
                // Map server-side validation errors
                const serverErrors: Record<string, string> = {};
                for (const field of response.invalid_fields) {
                    const fieldName = field.field.replace('your-', '');
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
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Subject*"
                    className={`${styles.input} ${errors.subject ? styles.inputError : ''}`}
                    disabled={isSubmitting}
                />
                {errors.subject && <span className={styles.error}>{errors.subject}</span>}
            </div>

            <div className={styles.formGroup}>
                <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Message*"
                    rows={5}
                    className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                    disabled={isSubmitting}
                />
                {errors.message && <span className={styles.error}>{errors.message}</span>}
            </div>

            <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Sending...' : 'Submit Now'}
            </button>
        </form>
    );
}
