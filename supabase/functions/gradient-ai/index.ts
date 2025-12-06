import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DO_AGENT_ENDPOINT = "https://fniauf5cqrhxslq46r4ech3e.agents.do-ai.run";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    
    console.log(`Gradient AI request - Action: ${action}`);
    
    let prompt = "";
    
    switch (action) {
      case "analyze_resume":
        prompt = `Analyze this resume and job description for match score and improvements:
          
Resume:
${data.resumeText}

${data.jobDescription ? `Job Description:\n${data.jobDescription}` : ''}
${data.jobType ? `Job Type: ${data.jobType}` : ''}
${data.company ? `Target Company: ${data.company}` : ''}

Provide a structured analysis with:
1. Match score (0-100)
2. Key strengths identified
3. Missing skills or gaps
4. Specific improvement recommendations
5. Keywords to add`;
        break;
        
      case "store_transcript":
        prompt = `Store and analyze this interview transcript:

Transcript:
${data.transcript}

Metadata:
- Score: ${data.score || 'N/A'}
- Job Type: ${data.jobType || 'N/A'}
- Experience Level: ${data.experienceLevel || 'N/A'}
- Date: ${data.date || new Date().toISOString()}

Analyze the performance and identify:
1. Strong answers
2. Weak areas
3. Specific improvements needed
4. Overall assessment`;
        break;
        
      case "get_questions":
        prompt = `Provide interview questions for:
- Job Type: ${data.jobType || 'Software Engineer'}
- Experience Level: ${data.experienceLevel || 'Mid-level'}
- Company: ${data.company || 'Tech company'}
- Focus Areas: ${data.focusAreas?.join(', ') || 'Technical and behavioral'}

Generate 5-10 relevant interview questions organized by category (technical, behavioral, situational).`;
        break;
        
      case "track_progress":
        prompt = `Analyze user improvement over time based on these past interviews:

${JSON.stringify(data.interviews, null, 2)}

Provide:
1. Overall progress trend
2. Areas that have improved
3. Areas still needing work
4. Recommended next focus areas
5. Personalized practice suggestions`;
        break;
        
      case "get_trends":
        prompt = `Provide current interview trends and insights for:
- Industry: ${data.industry || 'Tech'}
- Role: ${data.role || 'Software Engineer'}
- Location: ${data.location || 'General'}
- Company Size: ${data.companySize || 'Any'}

Include:
1. Most common question types
2. Trending topics
3. Skills in high demand
4. Tips for success`;
        break;
        
      case "chat":
        // Direct chat with the agent
        prompt = data.message;
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action. Supported: analyze_resume, store_transcript, get_questions, track_progress, get_trends, chat' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Call DigitalOcean Gradient AI Agent
    const response = await fetch(`${DO_AGENT_ENDPOINT}/api/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: prompt }
        ],
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gradient AI error:', response.status, errorText);
      throw new Error(`Gradient AI request failed: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || result.response || result;

    console.log('Gradient AI response received successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        action,
        response: content,
        model: 'DigitalOcean Gradient AI'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Gradient AI error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Gradient AI request failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
