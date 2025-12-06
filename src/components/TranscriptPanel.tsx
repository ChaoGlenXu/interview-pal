import { TranscriptEntry } from '@/utils/RealtimeAudio';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, User, Bot } from 'lucide-react';

interface TranscriptPanelProps {
  transcripts: TranscriptEntry[];
  className?: string;
}

export function TranscriptPanel({ transcripts, className }: TranscriptPanelProps) {
  if (transcripts.length === 0) {
    return (
      <div className={cn("bg-card rounded-2xl border border-border/50 p-6", className)}>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold">Transcript</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <MessageSquare className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            Conversation transcript will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-card rounded-2xl border border-border/50 p-6", className)}>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold">Transcript</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-auto">
          {transcripts.length} messages
        </span>
      </div>
      
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4">
          {transcripts.map((entry, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3 animate-slide-up",
                entry.role === 'user' ? "flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                entry.role === 'assistant' 
                  ? "bg-primary/10 text-primary" 
                  : "bg-muted text-muted-foreground"
              )}>
                {entry.role === 'assistant' ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              
              <div className={cn(
                "flex-1 rounded-2xl px-4 py-3",
                entry.role === 'assistant' 
                  ? "bg-muted/50 rounded-tl-none" 
                  : "bg-primary/10 rounded-tr-none"
              )}>
                <p className="text-sm text-foreground leading-relaxed">
                  {entry.text}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {entry.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
