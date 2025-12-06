import { cn } from '@/lib/utils';
import aiAvatar from '@/assets/ai-avatar.png';

interface AIAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  isConnected: boolean;
  className?: string;
}

export function AIAvatar({ isSpeaking, isListening, isConnected, className }: AIAvatarProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outer glow effects */}
      {isConnected && (
        <>
          <div className={cn(
            "absolute inset-0 rounded-full blur-2xl transition-all duration-500",
            isSpeaking 
              ? "bg-score-good/30 animate-pulse" 
              : isListening 
                ? "bg-primary/30 animate-pulse"
                : "bg-muted/20"
          )} />
          {(isSpeaking || isListening) && (
            <div className={cn(
              "absolute -inset-4 rounded-full animate-ping opacity-20",
              isSpeaking ? "bg-score-good" : "bg-primary"
            )} style={{ animationDuration: '2s' }} />
          )}
        </>
      )}
      
      {/* Avatar container */}
      <div className={cn(
        "relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 transition-all duration-300 shadow-2xl",
        isConnected 
          ? isSpeaking 
            ? "border-score-good shadow-score-good/30" 
            : isListening 
              ? "border-primary shadow-primary/30"
              : "border-border"
          : "border-border/50 grayscale opacity-60"
      )}>
        <img 
          src={aiAvatar} 
          alt="AI Interviewer" 
          className={cn(
            "w-full h-full object-cover transition-transform duration-300",
            isConnected && (isSpeaking || isListening) && "scale-105"
          )}
        />
        
        {/* Status overlay */}
        {isConnected && (
          <div className={cn(
            "absolute inset-0 transition-opacity duration-300",
            isSpeaking 
              ? "bg-gradient-to-t from-score-good/20 to-transparent" 
              : isListening 
                ? "bg-gradient-to-t from-primary/20 to-transparent"
                : "bg-transparent"
          )} />
        )}
      </div>

      {/* Status indicator dot */}
      <div className={cn(
        "absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 shadow-lg",
        isConnected 
          ? isSpeaking 
            ? "bg-score-good text-white" 
            : isListening 
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          : "bg-muted/50 text-muted-foreground"
      )}>
        {isConnected 
          ? isSpeaking 
            ? "Speaking..." 
            : isListening 
              ? "Listening..."
              : "Ready"
          : "Offline"
        }
      </div>
    </div>
  );
}
