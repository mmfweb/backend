export interface Project {
  id: number;
  title: string;
  tagline: string;
  description: string;
  category: string;
  languages: string[];
  image_url: string;
  case_study: string;
  created_at: string;
  github_url: string;
  stars?: number;
  homepage?: string | null;
}

export interface Trajectory {
  id: number;
  years: string;
  role: string;
  description: string;
}
