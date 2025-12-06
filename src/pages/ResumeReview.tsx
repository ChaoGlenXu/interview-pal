import { useState } from 'react';
import { Header } from '@/components/Header';
import { ResumeUpload } from '@/components/ResumeUpload';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScoreCircle } from '@/components/ScoreCircle';
import { JOB_TYPES } from '@/types/interview';
import { FileText, Sparkles, Loader2, CheckCircle, AlertCircle, Lightbulb, Target, Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ResumeAnalysis {
  overallScore: number;
  matchScore: number | null;
  summary: string;
  strengths: string[];
  improvements: string[];
  keywordsMissing: string[];
  formattingTips: string[];
  experienceAnalysis: string;
  skillsAnalysis: string;
  recommendations: string[];
}

export default function ResumeReview() {
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState('');
  const [pdfData, setPdfData] = useState<{ base64: string; fileName: string } | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobType, setJobType] = useState('');
  const [company, setCompany] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);

  const handleFileData = (base64: string, fileName: string) => {
    setPdfData({ base64, fileName });
  };

  const handleResumeText = (text: string) => {
    setResumeText(text);
    // Clear PDF data if user pastes text directly
    if (!text.startsWith('[PDF file uploaded:')) {
      setPdfData(null);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() && !pdfData) {
      toast({
        title: 'Resume required',
        description: 'Please upload or paste your resume text.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { 
          resumeText: pdfData ? null : resumeText, 
          pdfBase64: pdfData?.base64,
          jobDescription, 
          jobType, 
          company 
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setAnalysis(data.analysis);
      toast({
        title: 'Analysis complete',
        description: 'Your resume has been analyzed successfully.',
      });
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Failed to analyze resume',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Analysis</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Resume Review
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Get instant AI feedback on your resume. Upload your resume and optionally add a job description for match analysis.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 animate-scale-in">
                <ResumeUpload
                  resumeText={resumeText}
                  onResumeText={handleResumeText}
                  onFileData={handleFileData}
                  label="Your Resume"
                />
              </div>

              <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Job Details (Optional)
                </h3>

                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type</Label>
                      <Select value={jobType} onValueChange={setJobType}>
                        <SelectTrigger id="jobType">
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          {JOB_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Target Company</Label>
                      <Input
                        id="company"
                        placeholder="e.g., Google, Amazon..."
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobDescription">Job Description</Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the job description here for match analysis..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!resumeText.trim() && !pdfData)}
                className="w-full gap-2"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {!analysis && !isAnalyzing && (
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-8 text-center animate-scale-in h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">Ready to Analyze</h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Upload your resume and click "Analyze Resume" to get AI-powered feedback and improvement suggestions.
                  </p>
                </div>
              )}

              {isAnalyzing && (
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-8 text-center animate-scale-in h-full flex flex-col items-center justify-center">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <h3 className="font-display font-semibold text-lg mb-2">Analyzing Resume</h3>
                  <p className="text-muted-foreground text-sm">
                    Our AI is reviewing your resume...
                  </p>
                </div>
              )}

              {analysis && (
                <>
                  {/* Score Cards */}
                  <div className="grid grid-cols-2 gap-4 animate-scale-in">
                    <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 text-center">
                      <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
                      <ScoreCircle score={analysis.overallScore} size="md" />
                    </div>
                    {analysis.matchScore !== null && (
                      <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Job Match</p>
                        <ScoreCircle score={analysis.matchScore} size="md" />
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                    <h3 className="font-display font-semibold mb-3">Summary</h3>
                    <p className="text-muted-foreground">{analysis.summary}</p>
                  </div>

                  {/* Strengths */}
                  <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 animate-scale-in" style={{ animationDelay: '0.15s' }}>
                    <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-score-good" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-score-good mt-2 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
                    <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-score-warning" />
                      Areas for Improvement
                    </h3>
                    <ul className="space-y-2">
                      {analysis.improvements.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-score-warning mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Keywords Missing */}
                  {analysis.keywordsMissing.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 animate-scale-in" style={{ animationDelay: '0.25s' }}>
                      <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Missing Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywordsMissing.map((keyword, i) => (
                          <span key={i} className="px-3 py-1 bg-muted rounded-full text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 animate-scale-in" style={{ animationDelay: '0.3s' }}>
                    <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Formatting Tips */}
                  {analysis.formattingTips.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 animate-scale-in" style={{ animationDelay: '0.35s' }}>
                      <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-muted-foreground" />
                        Formatting Tips
                      </h3>
                      <ul className="space-y-2">
                        {analysis.formattingTips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
