import { cn } from '@/lib/utils';

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreCircle({ score, size = 'md', showLabel = true }: ScoreCircleProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-score-excellent stroke-score-excellent';
    if (score >= 70) return 'text-score-good stroke-score-good';
    if (score >= 50) return 'text-score-medium stroke-score-medium';
    return 'text-score-needs-work stroke-score-needs-work';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Work';
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  const strokeWidth = {
    sm: 3,
    md: 4,
    lg: 6,
  };

  const textSize = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-4xl',
  };

  const radius = size === 'sm' ? 20 : size === 'md' ? 36 : 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn('relative', sizeClasses[size])}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth[size]}
            className="text-muted/30"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth={strokeWidth[size]}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn('transition-all duration-1000', getScoreColor(score))}
          />
        </svg>
        <div className={cn(
          'absolute inset-0 flex items-center justify-center font-display font-bold',
          textSize[size],
          getScoreColor(score)
        )}>
          {score}
        </div>
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium', getScoreColor(score))}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
