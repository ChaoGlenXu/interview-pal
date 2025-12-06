import { useState } from "react";
import { Search, Building2, DollarSign, Briefcase, MapPin, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";

interface JobResult {
  title: string;
  company: string;
  location: string;
  salary?: string;
  description?: string;
  url?: string;
  postedDate?: string;
}

interface CompanyResult {
  name: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
  industry?: string;
  size?: string;
  headquarters?: string;
}

interface SalaryResult {
  title: string;
  averageSalary: string;
  minSalary?: string;
  maxSalary?: string;
  location?: string;
  sampleSize?: number;
}

type SearchResult = JobResult[] | CompanyResult | SalaryResult[];

const JobSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [activeTab, setActiveTab] = useState("jobs");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      let action = "search_jobs";
      if (activeTab === "companies") {
        action = "get_company";
      } else if (activeTab === "salaries") {
        action = "get_salaries";
      }

      const { data, error } = await supabase.functions.invoke("job-search", {
        body: {
          action,
          query: searchQuery,
          location: location || undefined,
          filters: {
            limit: 20,
          },
        },
      });

      if (error) {
        console.error("Job search error:", error);
        toast({
          title: "Search Failed",
          description: error.message || "Failed to search. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.success && data?.data) {
        setResults(data.data);
        toast({
          title: "Search Complete",
          description: `Found results for "${searchQuery}"`,
        });
      } else if (data?.error) {
        toast({
          title: "Search Error",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderJobResults = (jobs: JobResult[]) => (
    <div className="grid gap-4">
      {jobs.map((job, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4" />
                  {job.company}
                </CardDescription>
              </div>
              {job.url && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={job.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-3">
              {job.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </Badge>
              )}
              {job.salary && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {job.salary}
                </Badge>
              )}
              {job.postedDate && (
                <Badge variant="outline">{job.postedDate}</Badge>
              )}
            </div>
            {job.description && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {job.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderCompanyResult = (company: CompanyResult) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {company.name}
        </CardTitle>
        {company.industry && (
          <CardDescription>{company.industry}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {company.rating && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{company.rating}</span>
              <span className="text-muted-foreground">/ 5.0 rating</span>
              {company.reviewCount && (
                <span className="text-sm text-muted-foreground">
                  ({company.reviewCount} reviews)
                </span>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {company.size && (
              <div>
                <p className="text-sm text-muted-foreground">Company Size</p>
                <p className="font-medium">{company.size}</p>
              </div>
            )}
            {company.headquarters && (
              <div>
                <p className="text-sm text-muted-foreground">Headquarters</p>
                <p className="font-medium">{company.headquarters}</p>
              </div>
            )}
          </div>
          {company.description && (
            <p className="text-sm text-muted-foreground">{company.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderSalaryResults = (salaries: SalaryResult[]) => (
    <div className="grid gap-4">
      {salaries.map((salary, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{salary.title}</CardTitle>
            {salary.location && (
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {salary.location}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-primary">
                {salary.averageSalary}
              </span>
              <span className="text-muted-foreground">average</span>
            </div>
            {(salary.minSalary || salary.maxSalary) && (
              <p className="text-sm text-muted-foreground">
                Range: {salary.minSalary} - {salary.maxSalary}
              </p>
            )}
            {salary.sampleSize && (
              <p className="text-xs text-muted-foreground mt-2">
                Based on {salary.sampleSize} reported salaries
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderResults = () => {
    if (!results) return null;

    if (activeTab === "jobs" && Array.isArray(results)) {
      return renderJobResults(results as JobResult[]);
    }
    
    if (activeTab === "companies" && !Array.isArray(results)) {
      return renderCompanyResult(results as CompanyResult);
    }
    
    if (activeTab === "salaries" && Array.isArray(results)) {
      return renderSalaryResults(results as SalaryResult[]);
    }

    return (
      <Card>
        <CardContent className="p-6">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Job Search</h1>
            <p className="text-muted-foreground">
              Search for jobs, companies, and salary information powered by Tadata
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Jobs
              </TabsTrigger>
              <TabsTrigger value="companies" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Companies
              </TabsTrigger>
              <TabsTrigger value="salaries" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Salaries
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <div className="flex gap-3 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder={
                      activeTab === "jobs"
                        ? "Job title, keywords, or company..."
                        : activeTab === "companies"
                        ? "Company name..."
                        : "Job title..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="h-12"
                  />
                </div>
                {activeTab !== "companies" && (
                  <div className="w-48">
                    <Input
                      placeholder="Location..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="h-12"
                    />
                  </div>
                )}
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading}
                  className="h-12 px-6"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="ml-2">Search</span>
                </Button>
              </div>

              <TabsContent value="jobs" className="mt-0">
                {!results && !isLoading && (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Search for job listings by title, keywords, or company name
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="companies" className="mt-0">
                {!results && !isLoading && (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Search for company information, ratings, and reviews
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="salaries" className="mt-0">
                {!results && !isLoading && (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Search for salary information by job title and location
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Searching...</span>
                </div>
              )}

              {renderResults()}
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default JobSearch;
