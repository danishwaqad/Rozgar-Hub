import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { FaExternalLinkAlt, FaGraduationCap, FaGlobe, FaUniversity } from 'react-icons/fa';
import SearchBar from '../components/SearchBar';
import { fetchIngestionStatus, fetchScholarships } from '../api';
import type { Scholarship } from '../types';

export default function Scholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncRunning, setSyncRunning] = useState(false);

  const loadScholarships = (search?: string, silent = false) => {
    if (!silent) setLoading(true);
    fetchScholarships({ search })
      .then((res) => {
        setScholarships(res.data.scholarships);
        setTotal(res.data.total);
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => {
    loadScholarships(searchQuery);

    let active = true;
    const timer = setInterval(async () => {
      try {
        const statusRes = await fetchIngestionStatus();
        if (!active) return;

        const running = statusRes.data.isRunning;
        setSyncRunning(running);
        if (running) {
          loadScholarships(searchQuery, true);
        }
      } catch {
        // Ignore polling errors to avoid interrupting the page.
      }
    }, 15000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    loadScholarships(query, false);
  };

  return (
    <>
      <Helmet>
        <title>Latest Scholarships | RozgarHub.pk</title>
        <meta
          name="description"
          content="Explore latest scholarships and grants with active deadlines and official apply links."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <p className="text-sm font-semibold text-green-700 mb-2">Scholarship Hub</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 tracking-tight">Latest Scholarships</h1>
          <p className="text-gray-500 mb-5">Find grants, fellowships, and funded programs with official apply links.</p>
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="flex justify-between items-center mb-6 bg-white border border-gray-200 rounded-xl px-5 py-4">
          <h2 className="text-2xl font-bold text-gray-800">{total} Scholarships Found</h2>
          {syncRunning && (
            <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-semibold">
              Sync in progress
            </span>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
            <p className="text-gray-500 mt-4">Loading scholarships...</p>
          </div>
        )}

        {!loading && scholarships.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-xl text-center">
            <p className="text-gray-700 text-lg">No scholarships found.</p>
            <p className="text-gray-500 mt-2">Please refresh after a moment to load latest data.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholarships.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-500 hover:shadow-xl transition duration-300">
              <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3 min-h-[72px]">{item.description}</p>

              <div className="space-y-2 text-sm text-gray-700 mb-5">
                <div className="flex items-center gap-2">
                  <FaUniversity className="text-green-600" />
                  <span>{item.provider}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaGlobe className="text-green-600" />
                  <span>{item.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaGraduationCap className="text-green-600" />
                  <span>{item.level} | {item.fundingType}</span>
                </div>
                <p className="font-semibold text-gray-800">Deadline: {format(new Date(item.deadline), 'dd MMM yyyy')}</p>
              </div>

              <a
                href={item.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
              >
                Apply Now <FaExternalLinkAlt />
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
