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
  const descriptionBlocks = buildDescriptionBlocks(job.description);

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
            <div className="space-y-4 text-gray-700 leading-8 text-[17px]">
              {descriptionBlocks.map((block, idx) => (
                <div key={`${idx}-${block.text.slice(0, 20)}`}>
                  {block.isHeading ? (
                    <h3 className="text-lg font-bold text-gray-900 mt-2">{block.text}</h3>
                  ) : (
                    <p>{block.text}</p>
                  )}
                </div>
              ))}
            </div>
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

type DescriptionBlock = {
  text: string;
  isHeading: boolean;
};

function buildDescriptionBlocks(raw: string): DescriptionBlock[] {
  const cleaned = decodeHtmlEntities(raw).replace(/\s+/g, ' ').trim();
  if (!cleaned) return [{ text: 'No description available.', isHeading: false }];

  const withSections = cleaned.replace(
    /(Responsibilities|Requirements|Qualifications|Benefits|About the role|How to apply|What you'll do|What you’ll do)\s*:?\s*/gi,
    '\n\n$1:\n'
  );

  let blocks = withSections
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  // If source sends one giant paragraph, split into readable sentence chunks.
  if (blocks.length === 1 && blocks[0].length > 420) {
    const sentences = blocks[0]
      .split(/(?<=[.!?])\s+(?=[A-Z])/)
      .map((item) => item.trim())
      .filter(Boolean);

    const chunked: string[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
      chunked.push(sentences.slice(i, i + 2).join(' '));
    }
    blocks = chunked.length > 0 ? chunked : blocks;
  }

  return blocks.map((block) => ({
    text: block,
    isHeading: isLikelyHeading(block),
  }));
}

function isLikelyHeading(value: string): boolean {
  const text = value.trim();
  if (!text.endsWith(':')) return false;
  if (text.length > 60) return false;
  return /^[A-Za-z][A-Za-z0-9 '\-()&]+:$/.test(text);
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}