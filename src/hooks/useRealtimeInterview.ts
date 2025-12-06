import { useState, useRef, useCallback, useEffect } from 'react';
import { RealtimeChat, TranscriptEntry } from '@/utils/RealtimeAudio';
import { useToast } from '@/hooks/use-toast';
import { generateInterviewFromSession, saveInterview } from '@/utils/interviewStorage';
import { Interview } from '@/types/interview';

interface InterviewSettings {
  jobType: string;
  experienceLevel: string;
  company: string;
  questionCount: number;
}

export function useRealtimeInterview() {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [savedInterview, setSavedInterview] = useState<Interview | null>(null);
  const chatRef = useRef<RealtimeChat | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const settingsRef = useRef<InterviewSettings | null>(null);

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
    setSavedInterview(null);
    
    try {
      chatRef.current = new RealtimeChat(handleMessage, handleTranscriptUpdate);
      await chatRef.current.init(settings.jobType, settings.experienceLevel, settings.company, settings.questionCount);
      
      startTimeRef.current = new Date();
      settingsRef.current = settings;
      
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

    // Save the interview session
    if (startTimeRef.current && settingsRef.current && transcripts.length > 0) {
      const interview = generateInterviewFromSession(
        settingsRef.current,
        transcripts,
        startTimeRef.current
      );
      saveInterview(interview);
      setSavedInterview(interview);
      
      toast({
        title: "Interview Saved",
        description: `Your practice session has been saved with a score of ${interview.score}/100`,
      });
    }
    
    startTimeRef.current = null;
  }, [transcripts, toast]);

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
    savedInterview,
    connect,
    disconnect,
  };
}
