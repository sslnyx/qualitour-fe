import { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { ContactForm } from '@/components/forms';

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

  // Translation helpers (placeholder)
  const t = {
    title: lang === 'zh' ? '联系我们' : 'Get in Touch',
    subtitle: lang === 'zh' ? '我们要在这里为您提供帮助' : 'We\'d love to hear from you. Here is how you can reach us.',
    formTitle: lang === 'zh' ? '给我们发信息' : 'Send us a Message',
    formDesc: lang === 'zh' ? '有疑问吗？请填写下面的表格。' : 'Have a question about a tour or need a custom itinerary? Fill out the form below.',
  };

  return (
    <main className="flex-grow bg-gray-50">
      {/* Premium Hero Section */}
      <section className="bg-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <Container className="relative z-10 text-center">
          <span className="text-[#f7941e] font-bold tracking-widest uppercase text-sm mb-4 block">
            Contact Us
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            {t.title}
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
            {t.subtitle}
          </p>
        </Container>
      </section>

      {/* Split Content Section */}
      <section className="py-12 md:py-20 relative z-10 -mt-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">

            {/* Left Column: Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              {/* Contact Cards */}
              <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-transform hover:-translate-y-1 duration-300 border-l-4 border-[#f7941e]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-icons text-[#f7941e]">phone</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-500 text-sm mb-3">Mon-Fri from 9am to 6pm PST</p>
                    <a href="tel:+17789456000" className="text-xl font-semibold text-gray-800 hover:text-[#f7941e] transition-colors">
                      +1 (778) 945-6000
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-transform hover:-translate-y-1 duration-300 border-l-4 border-[#f7941e]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-icons text-[#f7941e]">mail</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-500 text-sm mb-3">Our team will respond within 24 hours</p>
                    <a href="mailto:info@qualitour.ca" className="text-xl font-semibold text-gray-800 hover:text-[#f7941e] transition-colors break-all">
                      info@qualitour.ca
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-transform hover:-translate-y-1 duration-300 border-l-4 border-[#f7941e]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-icons text-[#f7941e]">location_on</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Office</h3>
                    <p className="text-gray-500 text-sm mb-3">Come say hello at our office headquarters</p>
                    <address className="text-lg text-gray-800 not-italic font-medium">
                      8283 Granville St<br />
                      Vancouver, BC V6P 4Z6<br />
                      Canada
                    </address>
                  </div>
                </div>
              </div>

              {/* FAQ Teaser */}
              <div className="bg-[#f7941e]/5 rounded-2xl p-8 border border-[#f7941e]/20 mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Have a quick question?</h3>
                <p className="text-gray-600 mb-4 text-sm">You might find the answer you're looking for in our Frequently Asked Questions.</p>
                <Link href="/faq" className="text-[#f7941e] font-semibold hover:underline flex items-center gap-1 text-sm">
                  Visit FAQ Page <span className="material-icons text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-8 md:p-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.formTitle}</h2>
                  <p className="text-gray-500 mb-8">{t.formDesc}</p>

                  {/* Wrapper to style inner form inputs if needed, though module classes handle most */}
                  <div className="contact-form-wrapper">
                    <ContactForm className="!max-w-full" />
                  </div>

                  <p className="text-xs text-center text-gray-400 mt-8">
                    By submitting this form, you agree to our <Link href="/privacy-policy" className="underline hover:text-gray-600">Privacy Policy</Link>.
                  </p>
                </div>
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <span className="material-icons text-green-500 text-base">lock</span>
                    Secure SSL Connection
                  </span>
                  <span>
                    Qualitour &copy; {new Date().getFullYear()}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* Map Section */}
      <section className="h-[500px] w-full relative z-0">
        <iframe
          width="100%"
          height="100%"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2602.9652944451893!2d-123.17161!3d49.26!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5486d0c5c5c5c5cd%3A0x0!2s8283%20Granville%20St%2C%20Vancouver%2C%20BC%20V6P%204Z6!5e0!3m2!1sen!2sca"
          style={{ border: 0, filter: 'grayscale(100%) contrast(1.2) brightness(0.9)' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
        ></iframe>
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none"></div>
      </section>
    </main>
  );
}


