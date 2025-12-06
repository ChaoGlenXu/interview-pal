import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceInterfaceProps {
  isConnected: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleMic: () => void;
}

export function VoiceInterface({
  isConnected,
  isSpeaking,
  isListening,
  onConnect,
  onDisconnect,
  onToggleMic,
}: VoiceInterfaceProps) {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Status indicator */}
      <div className={cn(
        "text-sm font-medium px-4 py-2 rounded-full transition-all duration-300",
        isConnected 
          ? isSpeaking 
            ? "bg-score-good/10 text-score-good" 
            : isListening 
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          : "bg-muted text-muted-foreground"
      )}>
        {isConnected 
          ? isSpeaking 
            ? "AI is speaking..." 
            : isListening 
              ? "Listening to you..."
              : "Ready to listen"
          : "Not connected"
        }
      </div>

      {/* Main voice button */}
      <div className="relative">
        {/* Animated rings */}
        {isConnected && (isSpeaking || isListening) && (
          <>
            <div className={cn(
              "absolute inset-0 rounded-full animate-ping opacity-20",
              isSpeaking ? "bg-score-good" : "bg-primary"
            )} />
            <div className={cn(
              "absolute -inset-4 rounded-full animate-pulse opacity-10",
              isSpeaking ? "bg-score-good" : "bg-primary"
            )} />
          </>
        )}
        
        <Button
          variant={isConnected ? "voice" : "hero"}
          size="icon-xl"
          onClick={isConnected ? onToggleMic : onConnect}
          className={cn(
            "relative z-10 transition-all duration-300",
            isConnected && !isListening && "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"
          )}
        >
          {isConnected ? (
            isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </Button>
      </div>

      {/* Connection controls */}
      {isConnected ? (
        <Button
          variant="destructive"
          onClick={onDisconnect}
          className="gap-2"
        >
          <PhoneOff className="w-4 h-4" />
          End Interview
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Click the microphone to start your mock interview session with our AI interviewer
        </p>
      )}
    </div>
  );
}
