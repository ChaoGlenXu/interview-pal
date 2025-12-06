export interface Interview {
  id: string;
  title: string;
  company: string;
  jobType: string;
  experienceLevel: string;
  date: Date;
  duration: number; // in minutes
  score: number; // out of 100
  feedback: {
    strengths: string[];
    improvements: string[];
    summary: string;
  };
  transcript?: string;
}

export type SortOption = 'date' | 'score' | 'company' | 'jobType';
export type FilterOption = {
  jobType?: string;
  experienceLevel?: string;
  company?: string;
  scoreRange?: [number, number];
};

export const JOB_TYPES = [
  'Software Engineering',
  'Data Science',
  'Product Management',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
  'Other',
];

export const EXPERIENCE_LEVELS = [
  'Entry Level',
  'Mid Level',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'Executive',
];
