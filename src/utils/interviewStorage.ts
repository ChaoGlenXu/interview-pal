import { Interview } from '@/types/interview';
import { TranscriptEntry } from '@/utils/RealtimeAudio';

const STORAGE_KEY = 'saved_interviews';

export function getSavedInterviews(): Interview[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const interviews = JSON.parse(stored);
    // Convert date strings back to Date objects
    return interviews.map((i: any) => ({
      ...i,
      date: new Date(i.date)
    }));
  } catch {
    return [];
  }
}

export function saveInterview(interview: Interview): void {
  const existing = getSavedInterviews();
  existing.unshift(interview);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function generateInterviewFromSession(
  settings: { jobType: string; experienceLevel: string; company: string },
  transcripts: TranscriptEntry[],
  startTime: Date
): Interview {
  const duration = Math.round((Date.now() - startTime.getTime()) / 60000);
  const questionCount = transcripts.filter(t => t.role === 'assistant').length;
  
  // Generate a simple score based on user response length and count
  const userResponses = transcripts.filter(t => t.role === 'user');
  const avgResponseLength = userResponses.length > 0
    ? userResponses.reduce((acc, t) => acc + t.text.length, 0) / userResponses.length
    : 0;
  
  // Score based on engagement (simplified for demo)
  const baseScore = Math.min(100, Math.max(40, 50 + (avgResponseLength / 10) + (userResponses.length * 5)));
  const score = Math.round(baseScore);

  // Generate feedback based on transcript
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (userResponses.length >= 3) {
    strengths.push('Good engagement throughout the interview');
  }
  if (avgResponseLength > 100) {
    strengths.push('Provided detailed responses');
  }
  if (avgResponseLength > 50) {
    strengths.push('Clear communication demonstrated');
  }

  if (userResponses.length < 3) {
    improvements.push('Try to engage more with follow-up questions');
  }
  if (avgResponseLength < 50) {
    improvements.push('Consider providing more detailed responses');
  }
  improvements.push('Practice articulating your thought process');

  // Build transcript string
  const transcriptText = transcripts
    .map(t => `${t.role === 'user' ? 'You' : 'AI'}: ${t.text}`)
    .join('\n\n');

  return {
    id: crypto.randomUUID(),
    title: `${settings.jobType} Interview`,
    company: settings.company || 'Practice Session',
    jobType: settings.jobType,
    experienceLevel: settings.experienceLevel,
    date: startTime,
    duration: Math.max(1, duration),
    score,
    feedback: {
      strengths: strengths.length > 0 ? strengths : ['Completed the interview session'],
      improvements,
      summary: `Completed ${questionCount} questions in ${duration} minutes. ${score >= 70 ? 'Good performance!' : 'Keep practicing to improve.'}`,
    },
    transcript: transcriptText,
  };
}
