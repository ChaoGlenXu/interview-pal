import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, Sparkles, BarChart3, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  const features = [
    {
      icon: Mic,
      title: 'Voice-First Practice',
      description: 'Practice with an AI interviewer that listens and responds naturally, just like a real interview.',
    },
    {
      icon: Sparkles,
      title: 'Smart Feedback',
      description: 'Get detailed analysis of your responses with actionable improvements and a comprehensive score.',
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'Review past interviews, identify patterns, and watch your skills improve over time.',
    },
    {
      icon: Clock,
      title: 'Practice Anytime',
      description: 'No scheduling needed. Practice whenever you want, as many times as you need.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="container relative z-10 py-24 lg:py-32">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 gap-2 px-4 py-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI-Powered Interview Practice
            </Badge>
            
            <h1 className="font-display text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 animate-slide-up">
              Ace Your Next
              <span className="block gradient-hero bg-clip-text text-transparent">
                Interview
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Practice with our AI voice agent, receive instant feedback, 
              and track your progress. Land your dream job with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/practice">
                <Button variant="hero" size="xl" className="gap-2">
                  <Mic className="w-5 h-5" />
                  Start Practicing
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="glass" size="xl">
                  View Dashboard
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 mt-12 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-score-good" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-score-good" />
                <span>Unlimited practice sessions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive interview preparation tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 bg-background rounded-2xl border border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-4 shadow-md">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="gradient-hero rounded-3xl p-12 lg:p-16 text-center shadow-glow">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Start Practicing?
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
              Join thousands of job seekers who have improved their interview skills with InterviewAI
            </p>
            <Link to="/practice">
              <Button variant="glass" size="xl" className="gap-2 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                <Mic className="w-5 h-5" />
                Start Your First Interview
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Mic className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">InterviewAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 InterviewAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
