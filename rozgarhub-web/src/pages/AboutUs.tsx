import { Helmet } from 'react-helmet-async';

export default function AboutUs() {
  return (
    <>
      <Helmet>
        <title>About Us | RozgarHub.pk</title>
        <meta
          name="description"
          content="Learn about RozgarHub.pk, its mission, and the developer behind this platform."
        />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-7 md:p-9 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-4">About Us</h1>
          <p className="text-gray-600 leading-relaxed mb-5">
            RozgarHub.pk is built to help job seekers and students find trusted opportunities in one place,
            including government jobs, private jobs, international roles, and scholarships.
          </p>
          <p className="text-gray-600 leading-relaxed mb-5">
            We focus on providing simple navigation, updated listings, and useful filters so users can
            quickly discover relevant opportunities and apply through official sources.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Developer Information</h2>
            <p className="text-gray-700">
              <span className="font-semibold">Name:</span> Danish Waqad
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Role:</span> Developer
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Email:</span> DanishWaqad@gmail.com
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
