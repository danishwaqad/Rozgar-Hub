import { Helmet } from 'react-helmet-async';

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | RozgarHub.pk</title>
        <meta
          name="description"
          content="Read the privacy policy of RozgarHub.pk including data usage, cookies, and third-party services."
        />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-7 md:p-9 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-6">Privacy Policy</h1>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              RozgarHub.pk respects user privacy. We may collect limited non-personal information such as
              browser type, device information, and usage data to improve the website experience.
            </p>
            <p>
              We may use cookies and similar technologies to enhance website functionality, analytics, and ad
              performance.
            </p>
            <p>
              Third-party vendors, including Google, may use cookies to serve ads based on users&apos; prior
              visits to this website or other websites.
            </p>
            <p>
              Google&apos;s use of advertising cookies enables it and its partners to serve ads based on user
              browsing behavior. Users may opt out of personalized advertising by visiting
              Google Ads Settings.
            </p>
            <p>
              We do not sell personally identifiable information. If you contact us directly, your provided
              details are used only for communication purposes.
            </p>
            <p>
              If you have privacy-related concerns, contact us at DanishWaqad@gmail.com.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
