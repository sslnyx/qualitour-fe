/**
 * Contact Form 7 REST API Integration
 * 
 * Submits form data to WordPress Contact Form 7 via REST API.
 * Requires the "Contact Form 7 REST API" plugin installed in WordPress.
 * 
 * Form IDs:
 * - Contact Form: 1979
 * - Tour Inquiry Form: 39288
 * - China Visa Inquiry Form: 39289
 */

export const CF7_FORM_IDS = {
    CONTACT: '1979',
    TOUR_INQUIRY: '39288',
    VISA_INQUIRY: '39289',
} as const;

export type CF7FormId = typeof CF7_FORM_IDS[keyof typeof CF7_FORM_IDS];

export interface CF7Response {
    status: 'mail_sent' | 'mail_failed' | 'validation_failed' | 'acceptance_missing' | 'spam' | 'aborted';
    message: string;
    invalid_fields?: Array<{
        field: string;
        message: string;
    }>;
}

function getWordPressOrigin(): string {
    // Try explicit origin variable first
    if (process.env.NEXT_PUBLIC_WORDPRESS_ORIGIN) {
        return process.env.NEXT_PUBLIC_WORDPRESS_ORIGIN.replace(/\/$/, '');
    }

    // Derive from API URL
    const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL;

    if (apiUrl) {
        try {
            const parsed = new URL(apiUrl);
            return parsed.origin;
        } catch {
            // fallback
        }
    }

    // Development fallback - use Live Link URL that browser can access
    // qualitour.local only works server-side, so use the Live Link for client forms
    return 'https://handsome-cellar.localsite.io';
}

/**
 * Submit a form to Contact Form 7 REST API
 * 
 * @param formId - The CF7 form ID (e.g., '97504c0')
 * @param formData - Form field data as key-value pairs
 * @returns CF7Response with status and message
 * 
 * @example
 * ```ts
 * const result = await submitCF7Form(CF7_FORM_IDS.CONTACT, {
 *   'your-name': 'John Doe',
 *   'your-email': 'john@example.com',
 *   'your-subject': 'Hello',
 *   'your-message': 'This is a test message.',
 * });
 * ```
 */
export async function submitCF7Form(
    formId: CF7FormId,
    formData: Record<string, string>
): Promise<CF7Response> {
    // Use local API route to proxy the request (avoids CORS issues)
    const endpoint = '/api/contact';

    // CF7 expects FormData, not JSON
    const body = new FormData();

    // Required CF7 internal fields
    body.append('_wpcf7', formId);
    body.append('_wpcf7_version', '6.0');
    body.append('_wpcf7_locale', 'en_US');
    body.append('_wpcf7_unit_tag', `wpcf7-f${formId}-o1`);
    body.append('_wpcf7_container_post', '0');

    // Add user form data
    for (const [key, value] of Object.entries(formData)) {
        body.append(key, value);
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body,
        });

        if (!response.ok) {
            console.error(`CF7 API Error: ${response.status} ${response.statusText}`);
            return {
                status: 'mail_failed',
                message: 'Failed to submit form. Please try again later.',
            };
        }

        const result: CF7Response = await response.json();
        return result;
    } catch (error) {
        console.error('CF7 Submission Error:', error);
        return {
            status: 'mail_failed',
            message: 'Network error. Please check your connection and try again.',
        };
    }
}

// ============================================
// Typed form submission helpers
// ============================================

export interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export interface TourInquiryFormData {
    tourId: string;
    tourTitle: string;
    name: string;
    email: string;
    phone: string;
    travelDate: string;
    numTravelers: number;
    message?: string;
}

export interface VisaInquiryFormData {
    name: string;
    email: string;
    phone: string;
    nationality: string;
    visaType: string;
    travelDate?: string;
    message?: string;
}

/**
 * Submit the general contact form
 */
export async function submitContactForm(data: ContactFormData): Promise<CF7Response> {
    return submitCF7Form(CF7_FORM_IDS.CONTACT, {
        'your-name': data.name,
        'your-email': data.email,
        'your-subject': data.subject,
        'your-message': data.message,
    });
}

/**
 * Submit a tour inquiry form
 */
export async function submitTourInquiryForm(data: TourInquiryFormData): Promise<CF7Response> {
    return submitCF7Form(CF7_FORM_IDS.TOUR_INQUIRY, {
        'tour-id': data.tourId,
        'tour-title': data.tourTitle,
        'your-name': data.name,
        'your-email': data.email,
        'your-phone': data.phone,
        'travel-date': data.travelDate,
        'num-travelers': String(data.numTravelers),
        'your-message': data.message || '',
    });
}

/**
 * Submit a visa inquiry form
 */
export async function submitVisaInquiryForm(data: VisaInquiryFormData): Promise<CF7Response> {
    return submitCF7Form(CF7_FORM_IDS.VISA_INQUIRY, {
        'your-name': data.name,
        'your-email': data.email,
        'your-phone': data.phone,
        'nationality': data.nationality,
        'visa-type': data.visaType,
        'travel-date': data.travelDate || '',
        'your-message': data.message || '',
    });
}
