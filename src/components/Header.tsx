import { Button } from '@/components/ui/button';
import { Mic, LayoutDashboard, History } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/practice', label: 'Practice', icon: Mic },
  ];

  return (
    <header className="sticky top-0 z-50 w-full gradient-glass border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-md">
            <Mic className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">InterviewAI</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  'gap-2 transition-all',
                  location.pathname === item.path && 'bg-primary/10 text-primary'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <Link to="/practice">
          <Button variant="hero" size="lg">
            <Mic className="w-4 h-4" />
            Start Interview
          </Button>
        </Link>
      </div>
    </header>
  );
}
