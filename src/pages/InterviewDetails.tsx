import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { InterviewDetail } from '@/components/InterviewDetail';
import { mockInterviews } from '@/data/mockInterviews';

export default function InterviewDetails() {
  const { id } = useParams<{ id: string }>();
  const interview = mockInterviews.find(i => i.id === id);

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
