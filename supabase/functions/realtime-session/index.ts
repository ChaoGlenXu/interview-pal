import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { jobType, experienceLevel, company, questionCount = 5, resumeText, jobDescription } = await req.json();

    let systemPrompt = `You are an expert AI interviewer conducting a mock interview. 
Your role is to help the candidate practice for a ${jobType} position at the ${experienceLevel} level${company ? ` at ${company}` : ''}.

Guidelines:
- Start by introducing yourself and explaining how the interview will proceed
- Ask exactly ${questionCount} questions total (mix of technical and behavioral as appropriate)
- Ask relevant questions one at a time
- Listen carefully to responses and provide brief, encouraging feedback
- Ask follow-up questions when appropriate
- Be professional but friendly
- After all ${questionCount} questions, wrap up the interview and provide a brief summary of their performance
- Speak naturally and conversationally`;

    if (resumeText) {
      systemPrompt += `\n\nThe candidate has provided their resume for context:\n${resumeText.substring(0, 2000)}`;
    }

    if (jobDescription) {
      systemPrompt += `\n\nThe job description they're applying for:\n${jobDescription.substring(0, 2000)}`;
    }

    systemPrompt += `\n\nBegin by greeting the candidate and asking them to introduce themselves.`;

    console.log("Creating session with prompt:", systemPrompt);

    // Request an ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        instructions: systemPrompt,
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 800
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Session created successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
