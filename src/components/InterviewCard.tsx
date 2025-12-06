import { Interview } from '@/types/interview';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScoreCircle } from './ScoreCircle';
import { Calendar, Clock, Building2, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface InterviewCardProps {
  interview: Interview;
  onClick?: () => void;
}

export function InterviewCard({ interview, onClick }: InterviewCardProps) {
  return (
    <Card 
      className={cn(
        "gradient-card border-border/50 cursor-pointer transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1 hover:border-primary/20",
        "animate-scale-in"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-foreground truncate">
              {interview.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>{interview.company}</span>
            </div>
          </div>
          <ScoreCircle score={interview.score} size="sm" showLabel={false} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="category">
            <Briefcase className="w-3 h-3 mr-1" />
            {interview.jobType}
          </Badge>
          <Badge variant="secondary">{interview.experienceLevel}</Badge>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{format(interview.date, 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{interview.duration} min</span>
          </div>
        </div>
        
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {interview.feedback.summary}
        </p>
      </CardContent>
    </Card>
  );
}
