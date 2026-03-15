export enum Category {
  DESIGN = 'Design & UX',
  CONTENT = 'Contenu & Structure',
  PERFORMANCE = 'Performance & Tech',
  SEO = 'SEO & Visibilité',
  ACCESSIBILITY = 'Accessibilité',
  SECURITY = 'Sécurité'
}

export interface EvaluationItem {
  id: string;
  category: Category;
  score: number; // 0 to 100
  notes: string;
}

export interface PageSpeedMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

export interface SiteMetadata {
  url: string;
  summary: string;
  techStack: string[];
  initialImpressions: string[];
  sources?: { title: string; uri: string }[];
  performance?: PageSpeedMetrics;
}

export interface AuditState {
  items: EvaluationItem[];
  metadata: SiteMetadata | null;
  overallScore: number;
}

export interface GeminiReport {
  executiveSummary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  finalVerdict: string;
}