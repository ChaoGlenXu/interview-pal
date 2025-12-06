import { useState } from "react";
import { Search, Building2, DollarSign, Briefcase, MapPin, Loader2, ExternalLink, TrendingUp, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";

interface JobListing {
  title: string;
  company: string;
  location: string;
  description?: string;
  url?: string;
  extensions?: Array<{ type: string; text?: string; link?: string }>;
}

interface SearchResultData {
  jobs?: JobListing[];
  relatedSearches?: Array<{ text: string; link: string }>;
  summary?: string;
  sources?: Array<{ title: string; url: string; source: string }>;
  data?: unknown;
  organic?: Array<{ title: string; description: string; link: string; source: string }>;
}

const JobSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [activeTab, setActiveTab] = useState("jobs");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResultData | null>(null);
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
      } else if (activeTab === "insights") {
        action = "get_insights";
      }

      const { data, error } = await supabase.functions.invoke("job-search", {
        body: {
          action,
          query: searchQuery,
          location: location || undefined,
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

  const renderJobResults = () => {
    if (!results?.jobs || results.jobs.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No job listings found</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {results.jobs.map((job, index) => (
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
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </Badge>
                </div>
                {job.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {job.description}
                  </p>
                )}
                {job.extensions && job.extensions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.extensions
                      .filter((ext) => ext.text && ext.link)
                      .slice(0, 4)
                      .map((ext, i) => (
                        <a
                          key={i}
                          href={ext.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          {ext.text}
                        </a>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {results.relatedSearches && results.relatedSearches.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Related Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {results.relatedSearches.slice(0, 6).map((related, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => {
                      setSearchQuery(related.text);
                    }}
                  >
                    {related.text}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderInsightsResults = () => {
    if (!results?.summary) {
      return (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No insights found</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Job Market Insights
            </CardTitle>
            <CardDescription>AI-powered analysis of "{searchQuery}"</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: results.summary
                    .replace(/\n/g, '<br />')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/### (.*?)(<br \/>|$)/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
                    .replace(/## (.*?)(<br \/>|$)/g, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
                    .replace(/# (.*?)(<br \/>|$)/g, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
                    .replace(/- (.*?)(<br \/>|$)/g, '<li class="ml-4">$1</li>')
                }}
              />
            </div>
          </CardContent>
        </Card>

        {results.sources && results.sources.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.sources.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span className="truncate">{source.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {source.source}
                    </Badge>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderSummaryResults = () => {
    if (!results?.summary) {
      return (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No results found</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {activeTab === "companies" ? (
              <Building2 className="h-5 w-5" />
            ) : (
              <DollarSign className="h-5 w-5" />
            )}
            {activeTab === "companies" ? "Company Information" : "Salary Information"}
          </CardTitle>
          <CardDescription>AI-powered analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: results.summary
                  .replace(/\n/g, '<br />')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/### (.*?)(<br \/>|$)/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
                  .replace(/## (.*?)(<br \/>|$)/g, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
                  .replace(/# (.*?)(<br \/>|$)/g, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
                  .replace(/- (.*?)(<br \/>|$)/g, '<li class="ml-4">$1</li>')
              }}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    if (activeTab === "jobs") {
      return renderJobResults();
    }
    
    if (activeTab === "insights") {
      return renderInsightsResults();
    }
    
    if (activeTab === "companies" || activeTab === "salaries") {
      return renderSummaryResults();
    }

    // Fallback: show raw JSON
    return (
      <Card>
        <CardContent className="p-6">
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(results, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case "jobs":
        return "Software Engineer, Data Scientist, etc.";
      case "companies":
        return "Google, Microsoft, etc.";
      case "salaries":
        return "Frontend Developer, Product Manager, etc.";
      case "insights":
        return "Job market trends, best cities for tech jobs, etc.";
      default:
        return "Search...";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Job Search & Insights</h1>
            <p className="text-muted-foreground">
              Search for jobs, companies, salaries, and get AI-powered market insights
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Jobs</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="companies" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Companies</span>
              </TabsTrigger>
              <TabsTrigger value="salaries" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Salaries</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <div className="flex gap-3 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder={getPlaceholder()}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="h-12"
                  />
                </div>
                {activeTab !== "companies" && activeTab !== "insights" && (
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

              <TabsContent value="insights" className="mt-0">
                {!results && !isLoading && (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Ask any job market question and get AI-powered insights
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => setSearchQuery("job market trends 2025")}
                        >
                          Job market trends 2025
                        </Badge>
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => setSearchQuery("best cities for tech jobs")}
                        >
                          Best cities for tech jobs
                        </Badge>
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => setSearchQuery("remote work opportunities")}
                        >
                          Remote work opportunities
                        </Badge>
                      </div>
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
                  <span className="ml-3 text-muted-foreground">
                    {activeTab === "insights" ? "Analyzing..." : "Searching..."}
                  </span>
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
