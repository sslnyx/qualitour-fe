import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to proxy Contact Form 7 submissions
 * This avoids CORS issues by making the request server-side
 */
export async function POST(request: NextRequest) {
    try {
        const incomingFormData = await request.formData();
        const formId = incomingFormData.get('_wpcf7') as string;

        if (!formId) {
            return NextResponse.json(
                { status: 'mail_failed', message: 'Form ID is required' },
                { status: 400 }
            );
        }

        // Get WordPress URL for server-side fetch
        // Prefer qualitour.local for local dev (no auth needed)
        // Use Live Link with auth only if qualitour.local is not accessible
        let wpOrigin = 'http://qualitour.local';
        let authHeader: string | undefined;

        // Check if we should use Live Link (typically for environments that can't access local)
        const useLiveLink = process.env.USE_LIVELINK === 'true' ||
            (process.env.WORDPRESS_API_URL?.includes('localsite.io') &&
                typeof process.env.USE_LOCAL === 'undefined');

        if (useLiveLink &&
            process.env.WORDPRESS_AUTH_USER &&
            process.env.WORDPRESS_AUTH_PASS) {
            wpOrigin = process.env.WORDPRESS_API_URL?.replace(/\/wp-json.*$/, '') || wpOrigin;
            const auth = Buffer.from(`${process.env.WORDPRESS_AUTH_USER}:${process.env.WORDPRESS_AUTH_PASS}`).toString('base64');
            authHeader = `Basic ${auth}`;
        }

        const endpoint = `${wpOrigin}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`;

        // Build the form body as multipart boundary string manually for CF7
        // CF7 requires multipart/form-data format
        const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
        let body = '';

        for (const [key, value] of incomingFormData.entries()) {
            if (typeof value === 'string') {
                body += `--${boundary}\r\n`;
                body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
                body += `${value}\r\n`;
            }
        }
        body += `--${boundary}--\r\n`;

        const headers: Record<string, string> = {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
        };
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body,
        });

        // Get response text first to handle non-JSON responses
        const responseText = await response.text();

        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            console.error('CF7 Non-JSON response:', responseText.substring(0, 200));
            return NextResponse.json(
                { status: 'mail_failed', message: 'Invalid response from server' },
                { status: 500 }
            );
        }

        return NextResponse.json(data, { status: response.ok ? 200 : response.status });
    } catch (error) {
        console.error('CF7 Proxy Error:', error);
        return NextResponse.json(
            { status: 'mail_failed', message: 'Failed to submit form. Please try again.' },
            { status: 500 }
        );
    }
}
