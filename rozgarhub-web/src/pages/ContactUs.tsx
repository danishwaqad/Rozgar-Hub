import { Helmet } from 'react-helmet-async';

export default function ContactUs() {
  return (
    <>
      <Helmet>
        <title>Contact Us | RozgarHub.pk</title>
        <meta
          name="description"
          content="Contact RozgarHub.pk for questions, suggestions, partnerships, or support."
        />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-7 md:p-9 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-4">Contact Us</h1>
          <p className="text-gray-600 leading-relaxed mb-6">
            If you have any issue, feedback, correction request, or business inquiry, feel free to contact us.
          </p>

          <div className="space-y-3 text-gray-700">
            <p>
              <span className="font-semibold">Contact Person:</span> Danish Waqad
            </p>
            <p>
              <span className="font-semibold">Email:</span>{' '}
              <a className="text-green-700 hover:underline" href="mailto:DanishWaqad@gmail.com">
                DanishWaqad@gmail.com
              </a>
            </p>
            <p>
              <span className="font-semibold">Role:</span> Developer
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
