import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { AIAvatar } from '@/components/AIAvatar';
import { TranscriptPanel } from '@/components/TranscriptPanel';
import { ResumeUpload } from '@/components/ResumeUpload';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { JOB_TYPES, EXPERIENCE_LEVELS } from '@/types/interview';
import { Settings, Sparkles, Loader2, CheckCircle, ChevronDown, FileText } from 'lucide-react';
import { useRealtimeInterview } from '@/hooks/useRealtimeInterview';
import { useNavigate } from 'react-router-dom';

export default function Practice() {
  const navigate = useNavigate();
  const {
    isConnected,
    isConnecting,
    isSpeaking,
    isListening,
    transcripts,
    savedInterview,
    interviewComplete,
    aiFinishedSpeaking,
    connect,
    disconnect,
  } = useRealtimeInterview();

  const [showSettings, setShowSettings] = useState(true);
  
  // Interview settings
  const [jobType, setJobType] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(5);
  
  // Optional resume and job post
  const [showOptional, setShowOptional] = useState(false);
  const [resumeText, setResumeText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');

  const handleConnect = async () => {
    const success = await connect({ 
      jobType, 
      experienceLevel, 
      company, 
      questionCount,
      resumeText,
      jobDescription
    });
    if (success) {
      setShowSettings(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowSettings(true);
  };

  // Auto-end interview when AI finishes speaking after interview completion
  useEffect(() => {
    if (interviewComplete && isConnected) {
      // Give AI 10 seconds to finish speaking before ending the call
      const timer = setTimeout(() => {
        handleDisconnect();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [interviewComplete, isConnected]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8 animate-slide-up">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Mock Interview Practice
            </h1>
            <p className="text-muted-foreground">
              Practice with our AI interviewer and get instant feedback
            </p>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 mb-8 animate-scale-in">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-lg">Interview Settings</h2>
              </div>

              <div className="grid gap-6">
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
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                      <SelectTrigger id="experience">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Target Company (Optional)</Label>
                    <Input
                      id="company"
                      placeholder="e.g., Google, Amazon, Meta..."
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="questionCount">Number of Questions</Label>
                    <Input
                      id="questionCount"
                      type="number"
                      min={1}
                      max={20}
                      placeholder="e.g., 5"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                    />
                  </div>
                </div>

                {/* Optional: Resume & Job Description */}
                <Collapsible open={showOptional} onOpenChange={setShowOptional}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Add Resume & Job Description (Optional)
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showOptional ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <ResumeUpload
                      resumeText={resumeText}
                      onResumeText={setResumeText}
                      compact
                      label="Your Resume"
                    />
                    <div className="space-y-2">
                      <Label htmlFor="jobDescription">Job Description</Label>
                      <Textarea
                        id="jobDescription"
                        placeholder="Paste the job description for more tailored questions..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground text-sm">AI-Powered Interview</p>
                      <p className="text-sm text-muted-foreground">
                        Our AI will ask relevant questions based on your selected job type and experience level. 
                        {resumeText && ' Your resume will be used to personalize questions.'}
                        {jobDescription && ' Questions will be tailored to the job requirements.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Interview Area */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* AI Avatar and Voice Controls */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-8 animate-scale-in flex flex-col items-center" style={{ animationDelay: '0.1s' }}>
              {/* AI Avatar */}
              <AIAvatar
                isSpeaking={isSpeaking}
                isListening={isListening}
                isConnected={isConnected}
                className="mb-8"
              />

              {/* Connection Button */}
              <div className="flex flex-col items-center gap-4">
                {isConnecting ? (
                  <Button variant="hero" size="lg" disabled className="gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting...
                  </Button>
                ) : isConnected ? (
                  <div className="flex flex-col items-center gap-3">
                    {interviewComplete && (
                      <div className="flex items-center gap-2 text-score-good mb-2 animate-fade-in">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Interview Complete! Saving...</span>
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={handleDisconnect}
                      className="gap-2"
                    >
                      End Interview
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handleConnect}
                    className="gap-2"
                  >
                    Start Interview
                  </Button>
                )}

                {!isConnected && !isConnecting && savedInterview && (
                  <div className="bg-score-good/10 border border-score-good/20 rounded-xl p-4 text-center animate-scale-in">
                    <CheckCircle className="w-8 h-8 text-score-good mx-auto mb-2" />
                    <p className="font-medium text-foreground">Interview Saved!</p>
                    <p className="text-sm text-muted-foreground mb-3">Score: {savedInterview.score}/100</p>
                    <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
                      View in Dashboard
                    </Button>
                  </div>
                )}

                {!isConnected && !isConnecting && !savedInterview && (
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    Click to start your mock interview with our AI interviewer
                  </p>
                )}
              </div>
            </div>

            {/* Transcript Panel */}
            <TranscriptPanel 
              transcripts={transcripts}
              className="animate-scale-in"
            />
          </div>

          {/* Tips */}
          {!isConnected && !isConnecting && (
            <div className="mt-8 text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <p className="font-medium mb-2">Tips for a great practice session:</p>
              <ul className="space-y-1">
                <li>• Find a quiet environment</li>
                <li>• Speak clearly and at a natural pace</li>
                <li>• Take your time to think before answering</li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
