export interface Job {
  id: number;
  title: string;
  slug: string;
  category: string;
  country: string;
  department: string;
  lastDate: string;
  salary: string;
  visaSponsored: boolean;
  applyLink: string;
  description: string;
  source: string;
  postedDate: string;
  isActive: boolean;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Scholarship {
  id: number;
  title: string;
  slug: string;
  provider: string;
  country: string;
  level: string;
  deadline: string;
  fundingType: string;
  applyLink: string;
  description: string;
  source: string;
  postedDate: string;
  isActive: boolean;
}

export interface ScholarshipsResponse {
  scholarships: Scholarship[];
  total: number;
  page: number;
  pageSize: number;
}

export interface IngestionStatus {
  isRunning: boolean;
  lastSyncUtc?: string | null;
  cooldownSecondsRemaining: number;
}