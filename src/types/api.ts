
export interface ResumeUploadResponse {
  resume_id: string;
  parsed_data?: any;
  message: string;
  status: "success" | "error";
}

export interface OptimizationResponse {
  job_id: string;
  status: "pending" | "processing" | "completed" | "error";
  message: string;
}

export interface Modification {
  section: string;
  original: string;
  improved: string;
  type: "Major" | "Minor";
  company?: string;
  position?: string;
}

export interface OptimizationResult {
  resume_id: string;
  job_id: string;
  status: string;
  created_at: string;
  keywords_extracted?: any[];
  match_details?: any;
  matches?: number;
  modifications: Modification[];
  analysis_data: {
    old_score: number;
    improved_score: number;
    match_percentage: number;
    keyword_matches: number;
    total_keywords: number;
  };
}

export interface OptimizationStatus {
  status: "pending" | "processing" | "completed" | "error";
  message: string;
  progress?: number;
}
