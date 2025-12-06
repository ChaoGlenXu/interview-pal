import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { InterviewCard } from '@/components/InterviewCard';
import { FilterBar } from '@/components/FilterBar';
import { mockInterviews } from '@/data/mockInterviews';
import { SortOption, FilterOption, Interview } from '@/types/interview';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScoreCircle } from '@/components/ScoreCircle';
import { getSavedInterviews } from '@/utils/interviewStorage';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filters, setFilters] = useState<FilterOption>({});
  const [savedInterviews, setSavedInterviews] = useState<Interview[]>([]);

  // Load saved interviews on mount
  useEffect(() => {
    setSavedInterviews(getSavedInterviews());
  }, []);

  // Combine mock and saved interviews
  const allInterviews = useMemo(() => {
    return [...savedInterviews, ...mockInterviews];
  }, [savedInterviews]);

  const filteredAndSortedInterviews = useMemo(() => {
    let result = [...allInterviews];

    // Apply filters
    if (filters.jobType) {
      result = result.filter(i => i.jobType === filters.jobType);
    }
    if (filters.experienceLevel) {
      result = result.filter(i => i.experienceLevel === filters.experienceLevel);
    }
    if (filters.company) {
      result = result.filter(i => i.company.toLowerCase().includes(filters.company!.toLowerCase()));
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.date.getTime() - a.date.getTime();
        case 'score':
          return b.score - a.score;
        case 'company':
          return a.company.localeCompare(b.company);
        case 'jobType':
          return a.jobType.localeCompare(b.jobType);
        default:
          return 0;
      }
    });

    return result;
  }, [sortBy, filters, allInterviews]);

  const averageScore = useMemo(() => {
    if (allInterviews.length === 0) return 0;
    return Math.round(allInterviews.reduce((acc, i) => acc + i.score, 0) / allInterviews.length);
  }, [allInterviews]);

  const handleCardClick = (interview: Interview) => {
    navigate(`/interview/${interview.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-card rounded-2xl border border-border/50 shadow-sm animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Interviews</p>
                <p className="font-display text-3xl font-bold text-foreground">{allInterviews.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mic className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-card rounded-2xl border border-border/50 shadow-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                <p className="font-display text-3xl font-bold text-foreground">{averageScore}/100</p>
              </div>
              <ScoreCircle score={averageScore} size="sm" showLabel={false} />
            </div>
          </div>

          <div className="p-6 bg-card rounded-2xl border border-border/50 shadow-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">This Week</p>
                <div className="flex items-center gap-2">
                  <p className="font-display text-3xl font-bold text-foreground">3</p>
                  <span className="text-xs text-score-good flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +2 from last week
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-score-good/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-score-good" />
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Interview History</h1>
            <p className="text-muted-foreground">Review your past practice sessions and track your progress</p>
          </div>
          <Link to="/practice">
            <Button variant="hero">
              <Mic className="w-4 h-4" />
              New Interview
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <FilterBar
          sortBy={sortBy}
          onSortChange={setSortBy}
          filters={filters}
          onFilterChange={setFilters}
        />

        {/* Interview Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredAndSortedInterviews.map((interview, index) => (
            <div key={interview.id} style={{ animationDelay: `${index * 0.05}s` }}>
              <InterviewCard
                interview={interview}
                onClick={() => handleCardClick(interview)}
              />
            </div>
          ))}
        </div>

        {filteredAndSortedInterviews.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No interviews found matching your filters</p>
            <Button variant="secondary" onClick={() => setFilters({})}>
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
