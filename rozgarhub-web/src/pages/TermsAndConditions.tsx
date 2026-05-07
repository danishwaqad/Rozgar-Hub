import { Helmet } from 'react-helmet-async';

export default function TermsAndConditions() {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions | RozgarHub.pk</title>
        <meta
          name="description"
          content="Read terms and conditions for using RozgarHub.pk job and scholarship platform."
        />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-7 md:p-9 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-6">Terms & Conditions</h1>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              By using RozgarHub.pk, you agree to use this website for lawful purposes only.
            </p>
            <p>
              Job and scholarship listings are shared for informational purposes. Users should always verify
              details from official sources before applying.
            </p>
            <p>
              We may update, remove, or modify listings and website features at any time without prior notice.
            </p>
            <p>
              Unauthorized copying, scraping, or misuse of content is not allowed.
            </p>
            <p>
              Continued use of the website means acceptance of current terms.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
