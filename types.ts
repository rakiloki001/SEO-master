export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisData {
  difficulty: 'Low' | 'Medium' | 'High';
  difficultyReason: string;
  relatedKeywords: string[];
  competitorTopics: string[];
  suggestedOutline: string;
  groundingSources: GroundingSource[];
}

export interface FormData {
  keyword: string;
  language: string;
  wordCount: number;
  customContext: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  REVIEW = 'REVIEW',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface GenerationConfig {
  formData: FormData;
  analysisData: AnalysisData;
}
