import { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { getLocalePrefix } from '@/i18n/config';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Privacy Policy | Qualitour',
  description: 'Qualitour Privacy Policy - Learn how we collect, use, and protect your personal information.',
};

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const localePrefix = getLocalePrefix(lang);

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <Container>
          <h1 className="text-4xl md:text-5xl font-bold text-text-heading mb-4">Privacy Policy</h1>
          <p className="text-text-muted">Last updated: {new Date().toLocaleDateString()}</p>
        </Container>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-16">
        <Container>
          <div className="max-w-3xl mx-auto prose prose-lg">
            <p className="text-text mb-6">
              This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from www.qualitour.ca (the "Site").
            </p>

            {/* Personal Information We Collect */}
            <h2 className="text-2xl font-bold text-text-heading mt-8 mb-4">Personal Information We Collect</h2>
            <p className="text-text mb-4">
              When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site. We refer to this automatically-collected information as "Device Information."
            </p>

            <p className="text-text mb-4">We collect Device Information using the following technologies:</p>

            <ul className="list-disc list-inside space-y-2 text-text mb-6">
              <li>"Cookies" are data files that are placed on your device or computer and often include an anonymous unique identifier. For more information about cookies, and how to disable cookies, visit <a href="http://www.allaboutcookies.org" className="text-[#f7941e] hover:text-[#e68a1c]">http://www.allaboutcookies.org</a></li>
              <li>"Log files" track actions occurring on the Site, and collect data including your IP address, browser type, Internet service provider, referring/exit pages, and date/time stamps.</li>
              <li>"Web beacons," "tags," and "pixels" are electronic files used to record information about how you browse the Site.</li>
            </ul>

            <p className="text-text mb-4">
              Additionally when you make a purchase or attempt to make a purchase through the Site, we collect certain information from you, including your name, billing address, shipping address, payment information (including credit card numbers), email address, and phone number. We refer to this information as "Order Information."
            </p>

            <p className="text-text mb-6">
              When we talk about "Personal Information" in this Privacy Policy, we are talking both about Device Information and Order Information.
            </p>

            {/* How Do We Use Your Personal Information */}
            <h2 className="text-2xl font-bold text-text-heading mt-8 mb-4">How Do We Use Your Personal Information?</h2>
            <p className="text-text mb-4">
              We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:
            </p>

            <ul className="list-disc list-inside space-y-2 text-text mb-6">
              <li>Communicate with you;</li>
              <li>Screen our orders for potential risk or fraud; and</li>
              <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
            </ul>

            <p className="text-text mb-6">
              We use the Device Information that we collect to help us screen for potential risk and fraud (in particular, your IP address), and more generally to improve and optimize our Site (for example, by generating analytics about how our customers browse and interact with the Site, and to assess the success of our marketing and advertising campaigns).
            </p>

            {/* Sharing Your Personal Information */}
            <h2 className="text-2xl font-bold text-text-heading mt-8 mb-4">Sharing Your Personal Information</h2>
            <p className="text-text mb-4">
              We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use FareHarbor to power our online booking–you can read more about how FareHarbor uses your Personal Information here: <a href="https://fareharbor.com/legal/privacy/" className="text-[#f7941e] hover:text-[#e68a1c]">https://fareharbor.com/legal/privacy/</a>. We also use Google Analytics to help us understand how our customers use the Site–you can read more about how Google uses your Personal Information here: <a href="https://www.google.com/intl/en/policies/privacy/" className="text-[#f7941e] hover:text-[#e68a1c]">https://www.google.com/intl/en/policies/privacy/</a>. You can also opt-out of Google Analytics here: <a href="https://tools.google.com/dlpage/gaoptout" className="text-[#f7941e] hover:text-[#e68a1c]">https://tools.google.com/dlpage/gaoptout</a>.
            </p>

            <p className="text-text mb-6">
              Finally, we may also share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.
            </p>

            {/* Behavioral Advertising */}
            <h2 className="text-2xl font-bold text-text-heading mt-8 mb-4">Behavioural Advertising</h2>
            <p className="text-text mb-4">
              As described above, we use your Personal Information to provide you with targeted advertisements or marketing communications we believe may be of interest to you. For more information about how targeted advertising works, you can visit the Network Advertising Initiative's ("NAI") educational page at <a href="http://www.networkadvertising.org/understanding-online-advertising/how-does-it-work" className="text-[#f7941e] hover:text-[#e68a1c]">http://www.networkadvertising.org/understanding-online-advertising/how-does-it-work</a>.
            </p>

            <p className="text-text mb-4">You can opt out of targeted advertising by:</p>

            <ul className="list-disc list-inside space-y-2 text-text mb-6">
              <li><a href="https://www.facebook.com/settings/?tab=ads" className="text-[#f7941e] hover:text-[#e68a1c]">FACEBOOK</a></li>
              <li><a href="https://www.google.com/settings/ads/anonymous" className="text-[#f7941e] hover:text-[#e68a1c]">GOOGLE</a></li>
            </ul>

            <p className="text-text mb-6">
              Additionally, you can opt out of some of these services by visiting the Digital Advertising Alliance's opt-out portal at: <a href="http://optout.aboutads.info/" className="text-[#f7941e] hover:text-[#e68a1c]">http://optout.aboutads.info/</a>.
            </p>

            {/* Do Not Track */}
            <h2 className="text-2xl font-bold text-text-heading mt-8 mb-4">Do Not Track</h2>
            <p className="text-text mb-6">
              Please note that we do not alter our Site's data collection and use practices when we see a Do Not Track signal from your browser.
            </p>

            {/* Your Rights */}
            <h2 className="text-2xl font-bold text-text-heading mt-8 mb-4">Your Rights</h2>
            <p className="text-text mb-4">
              If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.
            </p>

            <p className="text-text mb-6">
              Additionally, if you are a European resident we note that we are processing your information in order to fulfill contracts we might have with you (for example if you make an order through the Site), or otherwise to pursue our legitimate business interests listed above. Additionally, please note that your information will be transferred outside of Europe, including to Canada and the United States.
            </p>

            {/* Data Retention */}
            <h2 className="text-2xl font-bold text-text-heading mt-8 mb-4">Data Retention</h2>
            <p className="text-text mb-6">
              When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.
            </p>

            {/* Changes */}
            <h2 className="text-2xl font-bold text-text-heading mt-8 mb-4">Changes</h2>
            <p className="text-text mb-6">
              We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.
            </p>

            {/* Contact Us */}
            <h2 className="text-2xl font-bold text-text-heading mt-8 mb-4">Contact Us</h2>
            <p className="text-text mb-4">
              For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at <a href="mailto:info@qualitour.ca" className="text-[#f7941e] hover:text-[#e68a1c]">info@qualitour.ca</a> or by mail using the details provided below:
            </p>

            <p className="text-text">
              5635 Cambie Street<br />
              Vancouver, BC, V5Z 3A3<br />
              Canada
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
