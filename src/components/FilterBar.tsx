import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { JOB_TYPES, EXPERIENCE_LEVELS, SortOption, FilterOption } from '@/types/interview';
import { ArrowUpDown, Filter, X } from 'lucide-react';

interface FilterBarProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filters: FilterOption;
  onFilterChange: (filters: FilterOption) => void;
}

export function FilterBar({ sortBy, onSortChange, filters, onFilterChange }: FilterBarProps) {
  const hasActiveFilters = filters.jobType || filters.experienceLevel || filters.company;

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-xl border border-border/50 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filters:</span>
      </div>

      <Select
        value={filters.jobType || 'all'}
        onValueChange={(value) => onFilterChange({ ...filters, jobType: value === 'all' ? undefined : value })}
      >
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue placeholder="Job Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Job Types</SelectItem>
          {JOB_TYPES.map((type) => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.experienceLevel || 'all'}
        onValueChange={(value) => onFilterChange({ ...filters, experienceLevel: value === 'all' ? undefined : value })}
      >
        <SelectTrigger className="w-[160px] h-9">
          <SelectValue placeholder="Experience" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          {EXPERIENCE_LEVELS.map((level) => (
            <SelectItem key={level} value={level}>{level}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="score">Score</SelectItem>
            <SelectItem value="company">Company</SelectItem>
            <SelectItem value="jobType">Job Type</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
