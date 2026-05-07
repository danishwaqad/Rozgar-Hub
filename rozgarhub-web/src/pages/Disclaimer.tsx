import { Helmet } from 'react-helmet-async';

export default function Disclaimer() {
  return (
    <>
      <Helmet>
        <title>Disclaimer | RozgarHub.pk</title>
        <meta
          name="description"
          content="Read the disclaimer for jobs and scholarships listed on RozgarHub.pk."
        />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-7 md:p-9 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-6">Disclaimer</h1>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              RozgarHub.pk does not guarantee recruitment, admission, or funding outcomes for any listing.
            </p>
            <p>
              We are not an official hiring agency, government body, or scholarship authority. We only share
              opportunities from public sources and references.
            </p>
            <p>
              Users must independently verify eligibility, deadlines, and authenticity before making decisions.
            </p>
            <p>
              RozgarHub.pk is not liable for direct or indirect losses arising from use of the information
              provided on this website.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
