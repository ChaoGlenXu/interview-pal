import { Interview } from '@/types/interview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScoreCircle } from './ScoreCircle';
import { Calendar, Clock, Building2, Briefcase, CheckCircle, AlertCircle, ArrowLeft, RotateCcw, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface InterviewDetailProps {
  interview: Interview;
}

export function InterviewDetail({ interview }: InterviewDetailProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-4 -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {interview.title}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>{interview.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{format(interview.date, 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{interview.duration} min</span>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Badge variant="category">
              <Briefcase className="w-3 h-3 mr-1" />
              {interview.jobType}
            </Badge>
            <Badge variant="secondary">{interview.experienceLevel}</Badge>
          </div>
        </div>
        <ScoreCircle score={interview.score} size="lg" />
      </div>

      {/* Summary */}
      <div className="p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
        <h2 className="font-display text-xl font-semibold mb-3">Summary</h2>
        <p className="text-muted-foreground leading-relaxed">
          {interview.feedback.summary}
        </p>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-score-good/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-score-good" />
            </div>
            <h2 className="font-display text-xl font-semibold">Strengths</h2>
          </div>
          <ul className="space-y-3">
            {interview.feedback.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-score-good mt-2 shrink-0" />
                <span className="text-muted-foreground">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-score-medium/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-score-medium" />
            </div>
            <h2 className="font-display text-xl font-semibold">Areas to Improve</h2>
          </div>
          <ul className="space-y-3">
            {interview.feedback.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-score-medium mt-2 shrink-0" />
                <span className="text-muted-foreground">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Transcript */}
      {interview.transcript && (
        <div className="p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold">Conversation Transcript</h2>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {interview.transcript.split('\n').filter(line => line.trim()).map((line, index) => {
              const isAI = line.toLowerCase().startsWith('ai:') || line.toLowerCase().startsWith('interviewer:');
              const isUser = line.toLowerCase().startsWith('you:') || line.toLowerCase().startsWith('user:');
              
              return (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg ${
                    isAI 
                      ? 'bg-muted/50 border-l-2 border-primary' 
                      : isUser 
                        ? 'bg-accent/30 border-l-2 border-accent-foreground/30' 
                        : 'bg-muted/30'
                  }`}
                >
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{line}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Link to="/practice">
          <Button variant="hero" size="lg">
            <RotateCcw className="w-4 h-4" />
            Practice Again
          </Button>
        </Link>
      </div>
    </div>
  );
}
