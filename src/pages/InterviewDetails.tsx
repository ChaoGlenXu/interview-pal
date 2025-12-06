import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { Header } from '@/components/Header';
import { InterviewDetail } from '@/components/InterviewDetail';
import { mockInterviews } from '@/data/mockInterviews';
import { getSavedInterviews } from '@/utils/interviewStorage';

export default function InterviewDetails() {
  const { id } = useParams<{ id: string }>();
  
  const interview = useMemo(() => {
    // First check saved interviews (localStorage)
    const savedInterviews = getSavedInterviews();
    const savedInterview = savedInterviews.find(i => i.id === id);
    if (savedInterview) return savedInterview;
    
    // Fall back to mock interviews
    return mockInterviews.find(i => i.id === id);
  }, [id]);

  if (!interview) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center py-16">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Interview Not Found
            </h1>
            <p className="text-muted-foreground">
              The interview you're looking for doesn't exist.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl">
        <InterviewDetail interview={interview} />
      </main>
    </div>
  );
}
