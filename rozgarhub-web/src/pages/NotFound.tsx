import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found | RozgarHub.pk</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <p className="text-green-700 font-semibold mb-2">404 Error</p>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Page Not Found</h1>
          <p className="text-gray-600 mb-6">
            The page you are looking for does not exist or may have been moved.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </>
  );
}
