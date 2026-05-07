import { Helmet } from 'react-helmet-async';

export default function Faq() {
  return (
    <>
      <Helmet>
        <title>FAQ | RozgarHub.pk</title>
        <meta
          name="description"
          content="Frequently asked questions about using RozgarHub.pk for jobs and scholarships."
        />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-7 md:p-9 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-6">Frequently Asked Questions</h1>

          <div className="space-y-5 text-gray-700">
            <div>
              <h2 className="font-semibold text-gray-900">Is RozgarHub.pk a hiring agency?</h2>
              <p>No. We are an informational platform that lists opportunities and redirects users to official sources.</p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">Do you charge any fee for applying?</h2>
              <p>No. RozgarHub.pk does not charge users for job or scholarship applications.</p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">How often are listings updated?</h2>
              <p>Listings are refreshed regularly, and active opportunities are prioritized in results.</p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">Can I report a wrong or expired listing?</h2>
              <p>
                Yes. Contact us at
                {' '}
                <a href="mailto:DanishWaqad@gmail.com" className="text-green-700 hover:underline">
                  DanishWaqad@gmail.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
