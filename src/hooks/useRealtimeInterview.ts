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
  const [interviewComplete, setInterviewComplete] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const settingsRef = useRef<InterviewSettings | null>(null);
  const transcriptsRef = useRef<TranscriptEntry[]>([]);

  // Check if AI said interview is ending
  const checkForInterviewEnd = useCallback((text: string) => {
    const endPhrases = [
      'concludes our interview',
      'end of the interview',
      'interview is complete',
      'wrapping up',
      'that concludes',
      'thank you for your time',
      'best of luck',
      'good luck with',
      'interview has ended',
      'finished with the interview'
    ];
    const lowerText = text.toLowerCase();
    return endPhrases.some(phrase => lowerText.includes(phrase));
  }, []);

  const handleMessage = useCallback((event: any) => {
    console.log('handleMessage:', event.type);
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
    console.log('Transcript update:', newTranscripts.length, 'entries');
    setTranscripts(newTranscripts);
    transcriptsRef.current = newTranscripts;
    localStorage.setItem('interview_transcripts', JSON.stringify(newTranscripts));
    
    // Check if the last AI message indicates interview end
    const lastEntry = newTranscripts[newTranscripts.length - 1];
    if (lastEntry?.role === 'assistant' && checkForInterviewEnd(lastEntry.text)) {
      console.log('Interview end detected in AI response');
      setInterviewComplete(true);
    }
  }, [checkForInterviewEnd]);

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
      transcriptsRef.current = [];
      
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
    console.log('Disconnect called, transcripts:', transcriptsRef.current.length);
    
    // Disconnect the chat
    if (chatRef.current) {
      chatRef.current.disconnect();
      chatRef.current = null;
    }
    
    setIsConnected(false);
    setIsSpeaking(false);
    setIsListening(false);

    // Save the interview session using ref to get latest transcripts
    const currentTranscripts = transcriptsRef.current;
    console.log('Saving interview with', currentTranscripts.length, 'transcripts');
    
    if (startTimeRef.current && settingsRef.current && currentTranscripts.length > 0) {
      const interview = generateInterviewFromSession(
        settingsRef.current,
        currentTranscripts,
        startTimeRef.current,
        settingsRef.current.questionCount
      );
      saveInterview(interview);
      setSavedInterview(interview);
      
      toast({
        title: "Interview Saved",
        description: `Your practice session has been saved with a score of ${interview.score}/100`,
      });
    } else {
      console.log('Not saving - missing data:', {
        hasStartTime: !!startTimeRef.current,
        hasSettings: !!settingsRef.current,
        transcriptCount: currentTranscripts.length
      });
    }
    
    startTimeRef.current = null;
  }, [toast]);

  useEffect(() => {
    return () => {
      if (chatRef.current) {
        chatRef.current.disconnect();
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    isSpeaking,
    isListening,
    transcripts,
    savedInterview,
    interviewComplete,
    connect,
    disconnect,
  };
}
