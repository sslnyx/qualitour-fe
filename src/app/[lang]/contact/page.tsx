import { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { i18n } from '@/i18n/config';

export const runtime = 'edge';
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export const metadata: Metadata = {
  title: 'Contact Us | Qualitour',
  description: 'Get in touch with Qualitour. Contact us by phone, email, or visit our office in Vancouver.',
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <Container>
          <h1 className="text-4xl md:text-5xl font-bold text-text-heading mb-4">Contact Us</h1>
          <p className="text-text-muted text-lg">We're here to help and answer any questions you might have</p>
        </Container>
      </section>

      {/* Contact Information Cards */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Phone Card */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <span className="material-icons text-[#f7941e] text-5xl">phone</span>
              </div>
              <h3 className="text-2xl font-bold text-text-heading mb-4">Phone</h3>
              <a 
                href="tel:+17789456000" 
                className="text-lg text-text hover:text-[#f7941e] transition-colors font-semibold"
              >
                +1 (778) 945-6000
              </a>
              <p className="text-text-muted text-sm mt-2">Available Monday - Friday, 9 AM - 5 PM PST</p>
            </div>

            {/* Email Card */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <span className="material-icons text-[#f7941e] text-5xl">mail</span>
              </div>
              <h3 className="text-2xl font-bold text-text-heading mb-4">Email</h3>
              <a 
                href="mailto:info@qualitour.ca" 
                className="text-lg text-text hover:text-[#f7941e] transition-colors font-semibold break-all"
              >
                info@qualitour.ca
              </a>
              <p className="text-text-muted text-sm mt-2">We'll respond within 24 hours</p>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <span className="material-icons text-[#f7941e] text-5xl">location_on</span>
              </div>
              <h3 className="text-2xl font-bold text-text-heading mb-4">Location</h3>
              <address className="text-text not-italic">
                <p className="font-semibold mb-1">8283 Granville St</p>
                <p>Vancouver, BC V6P 4Z6</p>
                <p>Canada</p>
              </address>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="max-w-2xl mx-auto bg-gray-50 rounded-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-text-heading mb-2 text-center">Send us a Message</h2>
            <p className="text-text-muted text-center mb-8">Have a question? Fill out the form below and we'll get back to you as soon as possible.</p>

            <form className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-text-heading mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7941e]"
                  placeholder="Your full name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-text-heading mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7941e]"
                  placeholder="your@email.com"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-text-heading mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7941e]"
                  placeholder="(778) 945-6000"
                />
              </div>

              {/* Subject Field */}
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-text-heading mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7941e]"
                  placeholder="How can we help?"
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-text-heading mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7941e] resize-none"
                  placeholder="Please tell us more about your inquiry..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#f7941e] hover:bg-[#e68a1c] text-white font-semibold py-3 px-6 rounded-md transition-colors"
              >
                Send Message
              </button>
            </form>

            <p className="text-text-muted text-sm text-center mt-6">
              By submitting this form, you agree to our <Link href="/privacy-policy" className="text-[#f7941e] hover:text-[#e68a1c]">Privacy Policy</Link>
            </p>
          </div>
        </Container>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-gray-50">
        <Container>
          <h2 className="text-3xl font-bold text-text-heading mb-8 text-center">Find Us on the Map</h2>
          <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
            <iframe
              width="100%"
              height="100%"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2602.9652944451893!2d-123.17161!3d49.26!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5486d0c5c5c5c5cd%3A0x0!2s8283%20Granville%20St%2C%20Vancouver%2C%20BC%20V6P%204Z6!5e0!3m2!1sen!2sca!4v1234567890"
              style={{ border: 0 }}
            //   allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </Container>
      </section>
    </main>
  );
}
