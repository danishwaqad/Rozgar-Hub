import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { fetchIngestionStatus, fetchJobs } from '../api';
import type { Job } from '../types';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';
import { FaBuilding, FaPlane, FaUserTie, FaGraduationCap } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import AdSlot from '../components/AdSlot';

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [syncRunning, setSyncRunning] = useState(false);

  useEffect(() => {
    loadJobs();

    let active = true;
    const timer = setInterval(async () => {
      try {
        const statusRes = await fetchIngestionStatus();
        if (!active) return;

        const running = statusRes.data.isRunning;
        setSyncRunning(running);
        if (running) {
          loadJobs(undefined, true);
        }
      } catch {
        // Ignore polling errors to avoid interrupting the page.
      }
    }, 15000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const loadJobs = (search?: string, silent = false) => {
    if (!silent) setLoading(true);
    fetchJobs({ search })
      .then(res => {
        setJobs(res.data.jobs);
        setTotal(res.data.total);
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  const categories = [
    { name: 'Govt Jobs Pakistan', slug: 'govt-pk', icon: FaBuilding, color: 'from-blue-500 to-blue-600' },
    { name: 'Dubai & Gulf Jobs', slug: 'international', icon: FaPlane, color: 'from-green-500 to-green-600' },
    { name: 'Private Jobs', slug: 'private-pk', icon: FaUserTie, color: 'from-purple-500 to-purple-600' },
    { name: 'Scholarships', slug: 'scholarships', icon: FaGraduationCap, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <>
      <Helmet>
        <title>RozgarHub.pk - Latest Jobs in Pakistan & Dubai 2026 | Govt Jobs, Visa Sponsored</title>
        <meta name="description" content="Find latest Govt jobs Pakistan, Dubai jobs, visa sponsored jobs 2026. FPSC, PPSC, NTS, Overseas jobs daily updated." />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-700 via-emerald-700 to-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold bg-white/15 border border-white/25 mb-5">
              Trusted daily opportunities
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg tracking-tight">
              Find Your Dream Job in <br/>Pakistan & Dubai
            </h1>
            <p className="text-lg md:text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
              Latest Govt Jobs, Dubai Visa Sponsored Jobs, Private Jobs and Scholarships in one place.
            </p>
            <div className="max-w-2xl mx-auto">
              <SearchBar onSearch={loadJobs} />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">Browse by Category</h2>
        <p className="text-gray-500 text-center mb-8">Choose the stream you want to explore quickly.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {categories.map(cat => (
            <Link key={cat.slug} to={cat.slug === 'scholarships' ? '/scholarships' : `/category/${cat.slug}`} className="group">
              <div className="bg-white rounded-2xl border border-gray-200 p-7 hover:border-green-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`bg-gradient-to-br ${cat.color} w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition duration-300`}>
                  <cat.icon className="text-3xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.name}</h3>
                <p className="text-gray-600 font-medium">Latest openings</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest Jobs</h2>
          <div className="flex items-center gap-3">
            {syncRunning && (
              <span className="text-green-700 bg-green-100 px-4 py-2 rounded-full text-xs font-semibold">
                Sync in progress (auto-refresh on)
              </span>
            )}
            <span className="text-gray-600 bg-gray-100 px-5 py-2 rounded-full text-sm font-bold">{total} jobs found</span>
          </div>
        </div>

        <AdSlot slot={import.meta.env.VITE_ADSENSE_HOME_SLOT || ''} className="mb-8" />

        {loading? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
            <p className="text-gray-500 mt-4 font-semibold">Loading jobs...</p>
          </div>
        ) : jobs.length === 0? (
          <div className="bg-yellow-50 border-2 border-yellow-200 p-8 rounded-2xl text-center">
            <p className="text-gray-700 text-lg font-semibold">No jobs found.</p>
            <p className="text-gray-500 mt-2">Please refresh again after a moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </div>
    </>
  );
}