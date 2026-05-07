import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchIngestionStatus, fetchJobs } from '../api';
import type { Job } from '../types';
import JobCard from '../components/JobCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';

export default function JobsByCategory() {
  const { category } = useParams<{ category: string }>();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncRunning, setSyncRunning] = useState(false);

  useEffect(() => {
    setPage(1);
    setSearchQuery('');
    loadJobs(1, undefined, false);
  }, [category]);

  useEffect(() => {
    let active = true;
    const timer = setInterval(async () => {
      try {
        const statusRes = await fetchIngestionStatus();
        if (!active) return;

        const running = statusRes.data.isRunning;
        setSyncRunning(running);
        if (running) {
          loadJobs(page, searchQuery, true);
        }
      } catch {
        // Ignore polling errors to avoid interrupting the page.
      }
    }, 15000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [page, searchQuery, category]);

  const loadJobs = (pageNum: number, search?: string, silent = false) => {
    if (!silent) setLoading(true);
    fetchJobs({ category, page: pageNum, search })
     .then(res => {
        setJobs(res.data.jobs);
        setTotal(res.data.total);
      })
     .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    loadJobs(1, query, false);
  };

  const categoryTitles: Record<string, string> = {
    'govt-pk': 'Government Jobs Pakistan 2026',
    'international': 'Dubai & Gulf Jobs - Visa Sponsored',
    'private-pk': 'Private Sector Jobs Pakistan',
  };

  const title = category? categoryTitles[category] || 'All Jobs' : 'All Jobs';
  const totalPages = Math.ceil(total / 20);

  return (
    <>
      <Helmet>
        <title>{title} | RozgarHub.pk</title>
        <meta name="description" content={`Latest ${title}. Apply online for ${total}+ jobs. Daily updated.`} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <p className="text-sm font-semibold text-green-700 mb-2">Category Results</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 tracking-tight">{title}</h1>
          <p className="text-gray-500 mb-5">Explore fresh openings with improved filters and live sync updates.</p>
          <SearchBar onSearch={handleSearch} />
        </div>

        <CategoryFilter />

        <div className="flex justify-between items-center mb-6 bg-white border border-gray-200 rounded-xl px-5 py-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {total} Jobs Found
          </h2>
          <div className="flex items-center gap-3">
            {syncRunning && (
              <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-semibold">
                Sync in progress
              </span>
            )}
            <span className="text-gray-600 text-sm font-medium">Page {page} of {totalPages}</span>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
            <p className="text-gray-500 mt-4">Loading jobs...</p>
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-xl text-center">
            <p className="text-gray-700 text-lg">No jobs found in this category.</p>
            <p className="text-gray-500 mt-2">Please refresh after a moment to load latest data.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {jobs.map(job => <JobCard key={job.id} job={job} />)}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              onClick={() => { setPage(p => p - 1); loadJobs(page - 1, searchQuery, false); }}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => { setPage(i + 1); loadJobs(i + 1, searchQuery, false); }}
                className={`px-4 py-2 border rounded-lg ${
                  page === i + 1? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => { setPage(p => p + 1); loadJobs(page + 1, searchQuery, false); }}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}