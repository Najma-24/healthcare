
export enum Sentiment {
  POSITIVE = 'Positive',
  NEGATIVE = 'Negative',
  NEUTRAL = 'Neutral'
}

export enum Category {
  WAIT_TIME = 'Wait Time',
  STAFF_BEHAVIOR = 'Staff Behavior',
  FACILITY_QUALITY = 'Facility Quality',
  MEDICAL_OUTCOME = 'Medical Outcome',
  BILLING = 'Billing',
  OTHER = 'Other'
}

export interface ReviewAnalysis {
  id: string;
  originalText: string;
  sentiment: Sentiment;
  sentimentScore: number; // 0 to 1
  category: Category;
  summary: string;
  improvementSuggestion: string;
  timestamp: string;
}

export interface DashboardStats {
  totalReviews: number;
  avgSentiment: number;
  sentimentDistribution: { name: string; value: number }[];
  categoryDistribution: { name: string; value: number }[];
}
