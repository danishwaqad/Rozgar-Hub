import { Link, useLocation } from 'react-router-dom';
import { FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt, FaCheckCircle, FaBuilding } from 'react-icons/fa';
import { format } from 'date-fns';
import type { Job } from '../types';

export default function JobCard({ job }: { job: Job }) {
  const isExpired = new Date(job.lastDate) < new Date();
  const location = useLocation();
  const backTo = `${location.pathname}${location.search}`;
  
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-green-500 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-3">
          <Link to={`/job/${job.slug}`} state={{ from: backTo }}>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 mb-2 line-clamp-2 leading-tight">
              {job.title}
            </h3>
          </Link>
          <p className="text-gray-600 font-medium flex items-center gap-2">
            <FaBuilding className="text-sm text-gray-400" /> 
            {job.department}
          </p>
        </div>
        {job.visaSponsored && (
          <span className="bg-green-100 text-green-700 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 font-bold whitespace-nowrap">
            <FaCheckCircle /> Visa
          </span>
        )}
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-3 text-gray-700">
          <div className="bg-green-50 p-2.5 rounded-lg">
            <FaMapMarkerAlt className="text-green-600" />
          </div>
          <span className="font-semibold">{job.country}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <div className="bg-blue-50 p-2.5 rounded-lg">
            <FaMoneyBillWave className="text-blue-600" />
          </div>
          <span className="font-semibold">{job.salary}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${isExpired? 'bg-red-50' : 'bg-orange-50'}`}>
            <FaCalendarAlt className={isExpired? 'text-red-600' : 'text-orange-600'} />
          </div>
          <span className={`font-bold ${isExpired? 'text-red-600' : 'text-gray-700'}`}>
            {format(new Date(job.lastDate), 'dd MMM yyyy')}
            {isExpired && ' - Expired'}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-bold">
          {job.source}
        </span>
        <Link 
          to={`/job/${job.slug}`}
          state={{ from: backTo }}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition font-bold text-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}