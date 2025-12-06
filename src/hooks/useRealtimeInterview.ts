import { useState, useRef, useCallback, useEffect } from 'react';
import { RealtimeChat, TranscriptEntry } from '@/utils/RealtimeAudio';
import { useToast } from '@/hooks/use-toast';

interface InterviewSettings {
  jobType: string;
  experienceLevel: string;
  company: string;
}

export function useRealtimeInterview() {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = useCallback((event: any) => {
    switch (event.type) {
      case 'response.audio.delta':
        setIsSpeaking(true);
        setIsListening(false);
        break;
      case 'response.audio.done':
      case 'response.done':
        setIsSpeaking(false);
        setIsListening(true);
        break;
      case 'input_audio_buffer.speech_started':
        setIsListening(true);
        break;
      case 'input_audio_buffer.speech_stopped':
        setIsListening(false);
        break;
    }
  }, []);

  const handleTranscriptUpdate = useCallback((newTranscripts: TranscriptEntry[]) => {
    setTranscripts(newTranscripts);
    // Store in localStorage for persistence
    localStorage.setItem('interview_transcripts', JSON.stringify(newTranscripts));
  }, []);

  const connect = useCallback(async (settings: InterviewSettings) => {
    if (!settings.jobType || !settings.experienceLevel) {
      toast({
        title: "Please configure your interview",
        description: "Select a job type and experience level to start",
        variant: "destructive",
      });
      return false;
    }

    setIsConnecting(true);
    
    try {
      chatRef.current = new RealtimeChat(handleMessage, handleTranscriptUpdate);
      await chatRef.current.init(settings.jobType, settings.experienceLevel, settings.company);
      
      setIsConnected(true);
      setIsListening(true);
      setTranscripts([]);
      localStorage.removeItem('interview_transcripts');
      
      toast({
        title: "Connected",
        description: "Your mock interview is starting...",
      });
      
      return true;
    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to start interview",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [handleMessage, handleTranscriptUpdate, toast]);

  const disconnect = useCallback(() => {
    chatRef.current?.disconnect();
    chatRef.current = null;
    setIsConnected(false);
    setIsSpeaking(false);
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    isSpeaking,
    isListening,
    transcripts,
    connect,
    disconnect,
  };
}
