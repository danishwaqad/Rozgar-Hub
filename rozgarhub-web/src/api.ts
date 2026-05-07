import axios from 'axios';
import type { JobsResponse, Job, ScholarshipsResponse, IngestionStatus } from './types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5162/api';

export const fetchJobs = (params?: { 
  category?: string; 
  country?: string; 
  page?: number;
  search?: string;
}) => axios.get<JobsResponse>(`${API}/jobs`, { params });

export const fetchJobBySlug = (slug: string) => 
  axios.get<Job>(`${API}/jobs/${slug}`);

export const fetchScholarships = (params?: {
  country?: string;
  level?: string;
  page?: number;
  search?: string;
}) => axios.get<ScholarshipsResponse>(`${API}/scholarships`, { params });

export const fetchIngestionStatus = () =>
  axios.get<IngestionStatus>(`${API}/ingestion/status`);