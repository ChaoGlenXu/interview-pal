import { useState } from 'react';
import { Header } from '@/components/Header';
import { VoiceInterface } from '@/components/VoiceInterface';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { JOB_TYPES, EXPERIENCE_LEVELS } from '@/types/interview';
import { Settings, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Practice() {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  
  // Interview settings
  const [jobType, setJobType] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<string>('');
  const [company, setCompany] = useState<string>('');

  const handleConnect = () => {
    if (!jobType || !experienceLevel) {
      toast({
        title: "Please configure your interview",
        description: "Select a job type and experience level to start",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Voice agent coming soon!",
      description: "The AI voice interview feature will be available once connected to OpenAI's Realtime API.",
    });
    
    // Simulate connection for demo
    setIsConnected(true);
    setShowSettings(false);
    setIsListening(true);
    
    // Simulate AI speaking after a delay
    setTimeout(() => {
      setIsListening(false);
      setIsSpeaking(true);
      setTimeout(() => {
        setIsSpeaking(false);
        setIsListening(true);
      }, 3000);
    }, 1000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsSpeaking(false);
    setIsListening(false);
    setShowSettings(true);
  };

  const handleToggleMic = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
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

                <div className="space-y-2">
                  <Label htmlFor="company">Target Company (Optional)</Label>
                  <Input
                    id="company"
                    placeholder="e.g., Google, Amazon, Meta..."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground text-sm">AI-Powered Interview</p>
                      <p className="text-sm text-muted-foreground">
                        Our AI will ask relevant questions based on your selected job type and experience level. 
                        Speak naturally and get real-time feedback.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Voice Interface */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-12 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <VoiceInterface
              isConnected={isConnected}
              isSpeaking={isSpeaking}
              isListening={isListening}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onToggleMic={handleToggleMic}
            />
          </div>

          {/* Tips */}
          {!isConnected && (
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
