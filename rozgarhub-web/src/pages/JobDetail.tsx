import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchJobBySlug } from '../api';
import type { Job } from '../types';
import { FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt, FaBuilding, FaExternalLinkAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function JobDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const backTo = (location.state as { from?: string } | null)?.from || '/';

  useEffect(() => {
    if (slug) {
      fetchJobBySlug(slug)
        .then(res => setJob(res.data))
        .catch(() => toast.error('Job not found'))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return <div className="max-w-4xl mx-auto p-6 py-12 text-center text-gray-600 font-medium">Loading...</div>;
  if (!job) return <div className="max-w-4xl mx-auto p-6 py-12 text-center text-gray-600 font-medium">Job not found</div>;

  const isExpired = new Date(job.lastDate) < new Date();

  return (
    <>
      <Helmet>
        <title>{job.title} - {job.country} | RozgarHub.pk</title>
        <meta name="description" content={`Apply for ${job.title} at ${job.department}. ${job.salary}. Last date: ${format(new Date(job.lastDate), 'dd MMM yyyy')}`} />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link to={backTo} className="text-green-700 hover:text-green-800 mb-5 inline-block font-semibold">← Back to Jobs</Link>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-7 md:p-9 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm font-semibold text-green-700 mb-2">Job Overview</p>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">{job.title}</h1>
              <p className="text-lg text-gray-600">{job.department}</p>
            </div>
            {job.visaSponsored && (
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                Visa Sponsored
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 text-gray-700 border border-gray-200 rounded-xl p-4">
              <FaMapMarkerAlt className="text-2xl text-green-600 shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-semibold">{job.country}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700 border border-gray-200 rounded-xl p-4">
              <FaMoneyBillWave className="text-2xl text-green-600 shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Salary</p>
                <p className="font-semibold">{job.salary}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700 border border-gray-200 rounded-xl p-4">
              <FaCalendarAlt className="text-2xl text-green-600 shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Last Date to Apply</p>
                <p className={`font-semibold ${isExpired ? 'text-red-600' : ''}`}>
                  {format(new Date(job.lastDate), 'dd MMMM yyyy')}
                  {isExpired && ' - Expired'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700 border border-gray-200 rounded-xl p-4">
              <FaBuilding className="text-2xl text-green-600 shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Source</p>
                <p className="font-semibold">{job.source}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Job Description</h2>
            <div className="prose prose-gray max-w-none text-gray-700 whitespace-pre-line leading-relaxed">{job.description}</div>
          </div>

          <a 
            href={job.applyLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition ${
              isExpired 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg'
            }`}
            onClick={(e) => isExpired && e.preventDefault()}
          >
            {isExpired ? 'Application Closed' : 'Apply Now'} 
            {!isExpired && <FaExternalLinkAlt />}
          </a>
        </div>
      </div>
    </>
  );
}