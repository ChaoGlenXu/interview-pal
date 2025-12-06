import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple PDF text extraction using basic parsing
// This extracts visible text streams from PDF - works for most text-based PDFs
function extractTextFromPDF(base64Data: string): string {
  try {
    const binaryString = atob(base64Data);
    
    // Look for text streams in PDF
    const textMatches: string[] = [];
    
    // Pattern to find text in PDF streams (simplified)
    const textPattern = /\(([^)]+)\)/g;
    const tjPattern = /\[([^\]]+)\]\s*TJ/g;
    
    // Extract parenthesized text
    let match;
    while ((match = textPattern.exec(binaryString)) !== null) {
      const text = match[1]
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\');
      if (text.length > 1 && /[a-zA-Z]/.test(text)) {
        textMatches.push(text);
      }
    }
    
    // If we found text, return it
    if (textMatches.length > 0) {
      return textMatches.join(' ').replace(/\s+/g, ' ').trim();
    }
    
    // Fallback: try to find any readable text
    const readableText = binaryString.match(/[a-zA-Z0-9\s.,;:!?@#$%&*()-=+'"]{20,}/g);
    if (readableText) {
      return readableText.join(' ').replace(/\s+/g, ' ').trim();
    }
    
    return '';
  } catch (error) {
    console.error('PDF text extraction error:', error);
    return '';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, pdfBase64, jobDescription, jobType, company } = await req.json();

    let textToAnalyze = resumeText || '';
    
    // Parse PDF if provided
    if (pdfBase64) {
      console.log('Parsing PDF...');
      try {
        const extractedText = extractTextFromPDF(pdfBase64);
        if (extractedText && extractedText.length > 50) {
          textToAnalyze = extractedText;
          console.log('PDF parsed, text length:', textToAnalyze.length);
        } else {
          console.log('Could not extract meaningful text from PDF, will inform AI');
          textToAnalyze = '[PDF resume uploaded but text extraction was limited. Please provide general resume feedback based on typical resume best practices.]';
        }
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        textToAnalyze = '[PDF resume uploaded but could not be processed. Please provide general resume feedback based on typical resume best practices.]';
      }
    }

    if (!textToAnalyze || !textToAnalyze.trim()) {
      console.log('No resume text provided, resumeText:', resumeText, 'pdfBase64 provided:', !!pdfBase64);
      return new Response(
        JSON.stringify({ error: 'Resume text is required. Try pasting your resume text directly.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert resume reviewer and career coach. Analyze resumes and provide detailed, actionable feedback.

Your response must be a valid JSON object with this exact structure:
{
  "overallScore": <number 1-100>,
  "matchScore": <number 1-100 or null if no job description provided>,
  "summary": "<brief 1-2 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "improvements": ["<area for improvement 1>", "<area for improvement 2>", ...],
  "keywordsMissing": ["<keyword 1>", "<keyword 2>", ...],
  "formattingTips": ["<tip 1>", "<tip 2>", ...],
  "experienceAnalysis": "<analysis of work experience section>",
  "skillsAnalysis": "<analysis of skills section>",
  "recommendations": ["<specific recommendation 1>", "<specific recommendation 2>", ...]
}

Be specific, constructive, and professional. Focus on actionable improvements.`;

    let userPrompt = `Please analyze this resume:\n\n${textToAnalyze}`;
    
    if (jobDescription) {
      userPrompt += `\n\nThe candidate is applying for this position:\n${jobDescription}`;
    }
    
    if (jobType) {
      userPrompt += `\n\nJob Type: ${jobType}`;
    }
    
    if (company) {
      userPrompt += `\n\nTarget Company: ${company}`;
    }

    userPrompt += '\n\nProvide a comprehensive analysis as a JSON object.';

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const text = await response.text();
      console.error('AI gateway error:', response.status, text);
      throw new Error('AI analysis failed');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Extract JSON from the response (in case it's wrapped in markdown)
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    const analysis = JSON.parse(jsonContent);

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing resume:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to analyze resume' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
