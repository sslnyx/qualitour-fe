import { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { getLocalePrefix } from '@/i18n/config';

export const metadata: Metadata = {
  title: 'Privacy Policy | Qualitour',
  description: 'Qualitour Privacy Policy - Learn how we collect, use, and protect your personal information.',
};

// Policy sections with Material Icons
const policySections = [
  { id: 'information-collect', icon: 'description', title: 'Information We Collect' },
  { id: 'how-we-use', icon: 'settings', title: 'How We Use Your Information' },
  { id: 'sharing', icon: 'share', title: 'Information Sharing' },
  { id: 'your-rights', icon: 'verified_user', title: 'Your Rights' },
  { id: 'contact', icon: 'mail', title: 'Contact Us' },
];

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const localePrefix = getLocalePrefix(lang);

  return (
    <main className="flex-grow">
      {/* Premium Hero Section - Dark theme matching private-transfers */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#f7941e]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#f7941e]/10 rounded-full blur-3xl" />

        <Container className="relative z-10 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#f7941e]/20 backdrop-blur-sm rounded-full text-[#f7941e] text-sm font-bold tracking-widest mb-6">
              <span className="material-icons text-lg">lock</span>
              YOUR PRIVACY MATTERS
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Privacy Policy
            </h1>

            <p className="text-xl text-white/80 mb-4">
              We are committed to protecting your personal information and being transparent about how we use it.
            </p>
            <p className="text-white/50 text-sm mb-10">
              Last updated: December 15, 2024
            </p>

            {/* Quick Jump Links */}
            <div className="flex flex-wrap justify-center gap-3">
              {policySections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/10 hover:bg-white/20 transition-all"
                >
                  <span className="material-icons text-base">{section.icon}</span>
                  <span>{section.title}</span>
                </a>
              ))}
            </div>
          </div>
        </Container>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
          <span className="material-icons text-3xl">keyboard_arrow_down</span>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto">

            {/* Introduction Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
              <p className="text-lg text-gray-700 leading-relaxed">
                This Privacy Policy describes how <strong className="text-gray-900">Qualitour Travel & Tour Experiences</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
                collects, uses, and shares your personal information when you visit our website at{' '}
                <a href="https://www.qualitour.ca" className="text-[#f7941e] hover:text-[#e68a1c] font-medium">www.qualitour.ca</a> (the &quot;Site&quot;)
                or use our tour booking services.
              </p>
            </div>

            {/* Section 1: Information We Collect */}
            <div id="information-collect" className="scroll-mt-24 mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#f7941e] to-[#ff6b35] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200/50">
                  <span className="material-icons text-white text-2xl">description</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Information We Collect</h2>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Device Information</h3>
                <p className="text-gray-600 mb-4">
                  When you visit our Site, we automatically collect certain information about your device, including:
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    { label: 'Browser Information', desc: 'Your web browser type and version' },
                    { label: 'IP Address', desc: 'Your device\'s Internet Protocol address' },
                    { label: 'Cookies', desc: 'Data files placed on your device to enhance your experience' },
                    { label: 'Usage Data', desc: 'Pages visited, time spent, and interaction patterns' },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="material-icons text-[#f7941e] text-lg mt-0.5">check_circle</span>
                      <span className="text-gray-700"><strong className="text-gray-900">{item.label}:</strong> {item.desc}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-4">Booking Information</h3>
                <p className="text-gray-600 mb-4">
                  When you make a booking inquiry or purchase, we collect:
                </p>
                <ul className="space-y-3">
                  {[
                    { label: 'Contact Details', desc: 'Name, email address, and phone number' },
                    { label: 'Travel Information', desc: 'Preferred dates, destinations, and group size' },
                    { label: 'Payment Information', desc: 'Billing details (processed securely via third-party providers)' },
                    { label: 'Special Requirements', desc: 'Dietary needs, accessibility requirements, etc.' },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="material-icons text-[#f7941e] text-lg mt-0.5">check_circle</span>
                      <span className="text-gray-700"><strong className="text-gray-900">{item.label}:</strong> {item.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 2: How We Use Your Information */}
            <div id="how-we-use" className="scroll-mt-24 mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#f7941e] to-[#ff6b35] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200/50">
                  <span className="material-icons text-white text-2xl">settings</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">How We Use Your Information</h2>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { icon: 'flight', title: 'Fulfill Your Bookings', desc: 'Process tour reservations, arrange itineraries, and provide booking confirmations.' },
                    { icon: 'chat', title: 'Communicate With You', desc: 'Send booking updates, respond to inquiries, and provide customer support.' },
                    { icon: 'trending_up', title: 'Improve Our Services', desc: 'Analyze usage patterns to enhance our website and tour offerings.' },
                    { icon: 'security', title: 'Protect Against Fraud', desc: 'Screen transactions for potential risk and ensure secure operations.' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                        <span className="material-icons text-[#f7941e] text-xl">{item.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-gray-600 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Information Sharing */}
            <div id="sharing" className="scroll-mt-24 mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#f7941e] to-[#ff6b35] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200/50">
                  <span className="material-icons text-white text-2xl">share</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Information Sharing</h2>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <p className="text-gray-600 mb-6">
                  We may share your information with trusted third parties to help us provide and improve our services:
                </p>

                <div className="space-y-4">
                  {[
                    { icon: 'confirmation_number', title: 'Booking Partners', desc: 'We work with tour operators and booking platforms to fulfill your travel arrangements.' },
                    { icon: 'analytics', title: 'Analytics Services', desc: 'We use Google Analytics to understand how visitors use our Site.', link: { text: 'Opt out here', url: 'https://tools.google.com/dlpage/gaoptout' } },
                    { icon: 'gavel', title: 'Legal Requirements', desc: 'We may disclose information when required by law or to protect our rights.' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#f7941e]/30 transition-colors">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="material-icons text-gray-600">{item.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-gray-600 text-sm">
                          {item.desc}
                          {item.link && (
                            <>
                              {' '}
                              <a href={item.link.url} className="text-[#f7941e] hover:text-[#e68a1c]" target="_blank" rel="noopener noreferrer">
                                {item.link.text}
                              </a>.
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-3">
                  <span className="material-icons text-gray-600">info</span>
                  <p className="text-gray-600 text-sm">
                    We never sell your personal information to third parties for marketing purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4: Your Rights */}
            <div id="your-rights" className="scroll-mt-24 mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#f7941e] to-[#ff6b35] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200/50">
                  <span className="material-icons text-white text-2xl">verified_user</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Your Rights</h2>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <p className="text-gray-600 mb-6">
                  You have the following rights regarding your personal information:
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {[
                    { icon: 'visibility', title: 'Right to Access', desc: 'Request a copy of your data' },
                    { icon: 'edit', title: 'Right to Correct', desc: 'Update inaccurate information' },
                    { icon: 'delete', title: 'Right to Delete', desc: 'Request data removal' },
                    { icon: 'block', title: 'Right to Opt-Out', desc: 'Unsubscribe from marketing' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
                      <span className="material-icons text-[#f7941e]">{item.icon}</span>
                      <div>
                        <span className="font-semibold text-gray-900 block">{item.title}</span>
                        <span className="text-sm text-gray-500">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="material-icons text-gray-600 text-lg">public</span>
                    For EU Residents (GDPR)
                  </h4>
                  <p className="text-gray-600 text-sm">
                    If you are a resident of the European Economic Area, you have additional rights under GDPR.
                    Please note that your information may be transferred outside of Europe, including to Canada.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="material-icons text-gray-600 text-lg">schedule</span>
                    Data Retention
                  </h4>
                  <p className="text-gray-600 text-sm">
                    We retain your booking information for our records unless you request deletion.
                    Device information is typically retained for up to 2 years for analytics purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5: Contact Us */}
            <div id="contact" className="scroll-mt-24 mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#f7941e] to-[#ff6b35] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200/50">
                  <span className="material-icons text-white text-2xl">mail</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Contact Us</h2>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <p className="text-gray-600 mb-6">
                  For questions about our privacy practices, to exercise your rights, or to make a complaint, please contact us:
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <a href="mailto:info@qualitour.ca" className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#f7941e] hover:bg-orange-50/50 transition-all group">
                    <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#f7941e] rounded-xl flex items-center justify-center transition-colors">
                      <span className="material-icons text-gray-600 group-hover:text-white transition-colors">email</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 block">Email</span>
                      <span className="text-[#f7941e]">info@qualitour.ca</span>
                    </div>
                  </a>

                  <a href="tel:+17789456000" className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#f7941e] hover:bg-orange-50/50 transition-all group">
                    <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#f7941e] rounded-xl flex items-center justify-center transition-colors">
                      <span className="material-icons text-gray-600 group-hover:text-white transition-colors">phone</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 block">Phone</span>
                      <span className="text-[#f7941e]">(778) 945-6000</span>
                    </div>
                  </a>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="material-icons text-gray-600">location_on</span>
                    Mailing Address
                  </h4>
                  <p className="text-gray-600">
                    Qualitour Travel & Tour Experiences<br />
                    5635 Cambie Street<br />
                    Vancouver, BC V5Z 3A3<br />
                    Canada
                  </p>
                </div>
              </div>
            </div>

            {/* Policy Updates Notice */}
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-200">
              <p className="text-gray-500 text-sm">
                We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>
            </div>

          </div>
        </Container>
      </section>

      {/* Contact CTA Section - matching private-transfers style */}
      <section className="py-16 bg-white">
        <Container>
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-[#f7941e]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-[#f7941e]/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#f7941e] to-[#ff6b35] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <span className="material-icons text-white text-4xl">help_outline</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Have Questions About Your Privacy?</h2>
              <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">We&apos;re here to help. Reach out to our team for any privacy-related concerns.</p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href={`${localePrefix}/contact`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#f7941e] to-[#ff6b35] text-white font-bold rounded-full hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300"
                >
                  <span className="material-icons">mail</span>
                  Contact Us
                </Link>
                <a
                  href="tel:+17789456000"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <span className="material-icons">call</span>
                  +1 (778) 945-6000
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
