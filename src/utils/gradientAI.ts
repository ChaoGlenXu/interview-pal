import { supabase } from "@/integrations/supabase/client";

export type GradientAIAction = 
  | "analyze_resume" 
  | "store_transcript" 
  | "get_questions" 
  | "track_progress" 
  | "get_trends" 
  | "chat";

interface GradientAIRequest {
  action: GradientAIAction;
  data: Record<string, unknown>;
}

interface GradientAIResponse {
  success: boolean;
  action: string;
  response: string;
  model: string;
}

export async function callGradientAI(
  action: GradientAIAction, 
  data: Record<string, unknown>
): Promise<GradientAIResponse> {
  const { data: result, error } = await supabase.functions.invoke('gradient-ai', {
    body: { action, data }
  });

  if (error) {
    throw new Error(error.message || 'Failed to call Gradient AI');
  }

  return result as GradientAIResponse;
}

// Convenience functions for each action
export async function analyzeResumeWithGradient(
  resumeText: string,
  jobDescription?: string,
  jobType?: string,
  company?: string
) {
  return callGradientAI('analyze_resume', {
    resumeText,
    jobDescription,
    jobType,
    company
  });
}

export async function storeTranscript(
  transcript: string,
  metadata: {
    score?: number;
    jobType?: string;
    experienceLevel?: string;
    date?: string;
  }
) {
  return callGradientAI('store_transcript', {
    transcript,
    ...metadata
  });
}

export async function getInterviewQuestions(params: {
  jobType?: string;
  experienceLevel?: string;
  company?: string;
  focusAreas?: string[];
}) {
  return callGradientAI('get_questions', params);
}

export async function trackUserProgress(interviews: unknown[]) {
  return callGradientAI('track_progress', { interviews });
}

export async function getInterviewTrends(params: {
  industry?: string;
  role?: string;
  location?: string;
  companySize?: string;
}) {
  return callGradientAI('get_trends', params);
}

export async function chatWithGradient(message: string) {
  return callGradientAI('chat', { message });
}
