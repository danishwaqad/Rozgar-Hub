import { Helmet } from 'react-helmet-async';

export default function DataSources() {
  return (
    <>
      <Helmet>
        <title>Data Sources & Editorial Policy | RozgarHub.pk</title>
        <meta
          name="description"
          content="Learn how RozgarHub.pk collects, verifies, and updates jobs and scholarship listings."
        />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-7 md:p-9 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-6">
            Data Sources & Editorial Policy
          </h1>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              RozgarHub.pk publishes jobs and scholarship opportunities from public sources such as official
              government portals, company career pages, and recognized listing feeds.
            </p>
            <p>
              We try to keep listings fresh using periodic sync and filters. However, source websites may update
              details at any time, so users should always verify deadlines and eligibility from the official apply link.
            </p>
            <p>
              We remove or update listings when we identify expired, duplicate, or inaccurate information.
            </p>
            <p>
              If you find incorrect content, please report it via
              {' '}
              <a href="mailto:DanishWaqad@gmail.com" className="text-green-700 hover:underline">
                DanishWaqad@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
