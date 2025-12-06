import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TADATA_API_KEY = Deno.env.get("TADATA_API_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const TADATA_SERVER_URL = `https://brightdata-rkc5.mcp.tadata.com/?tadata-api-key=${TADATA_API_KEY}`;

// Helper to make JSON-RPC calls to MCP server
async function mcpCall(method: string, params: Record<string, unknown> = {}) {
  const requestBody = {
    jsonrpc: "2.0",
    id: Date.now(),
    method,
    params,
  };
  
  console.log(`MCP call: ${method}`, JSON.stringify(params));
  
  const response = await fetch(TADATA_SERVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
      "Authorization": `Bearer ${TADATA_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });
  
  const result = await response.json();
  console.log(`MCP response:`, JSON.stringify(result).substring(0, 500));
  
  if (result.error) {
    throw new Error(result.error.message || JSON.stringify(result.error));
  }
  
  return result.result;
}

// Call an MCP tool by name
async function callTool(toolName: string, args: Record<string, unknown>) {
  return await mcpCall("tools/call", {
    name: toolName,
    arguments: args,
  });
}

// Parse the search engine response content
function parseSearchResults(mcpResult: unknown) {
  try {
    if (!mcpResult || typeof mcpResult !== 'object') return null;
    
    const result = mcpResult as { content?: Array<{ type: string; text: string }> };
    if (!result.content || !Array.isArray(result.content)) return null;
    
    const textContent = result.content.find((c) => c.type === 'text');
    if (!textContent?.text) return null;
    
    const parsed = JSON.parse(textContent.text);
    return parsed;
  } catch (error) {
    console.error("Error parsing search results:", error);
    return null;
  }
}

// Use OpenAI to summarize job market information
async function summarizeWithAI(query: string, searchData: unknown): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.log("No OpenAI API key, returning raw data");
    return JSON.stringify(searchData);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are a helpful job market analyst. Analyze the search results and provide a clear, well-structured summary about the user's query. Use markdown formatting with headers, bullet points, and bold text to make the information easy to read. Focus on actionable insights and key statistics. If the data contains job listings, extract and summarize the key opportunities. If it's about market trends, provide analysis and recommendations.`
          },
          { 
            role: 'user', 
            content: `User query: "${query}"\n\nSearch results data:\n${JSON.stringify(searchData, null, 2)}\n\nPlease provide a comprehensive, well-formatted summary of this information.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    return JSON.stringify(searchData);
  } catch (error) {
    console.error('AI summarization error:', error);
    return JSON.stringify(searchData);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, location } = await req.json();
    
    console.log(`Job search request: action=${action}, query=${query}, location=${location}`);
    
    let result;
    let shouldSummarize = false;

    switch (action) {
      case "list_tools":
        result = await mcpCall("tools/list", {});
        break;
        
      case "search_jobs":
        const jobSearchQuery = location 
          ? `${query} jobs in ${location}` 
          : `${query} jobs`;
        
        const jobResult = await callTool("search_engine", {
          query: jobSearchQuery,
        });
        
        const parsedJobs = parseSearchResults(jobResult);
        if (parsedJobs?.organic) {
          // Transform to job listings format
          result = {
            jobs: parsedJobs.organic.map((item: { title?: string; source?: string; description?: string; link?: string; extensions?: Array<{ type: string; text?: string }> }) => ({
              title: item.title || '',
              company: item.source || '',
              description: item.description || '',
              url: item.link || '',
              location: location || 'Various',
              extensions: item.extensions || [],
            })),
            relatedSearches: parsedJobs.related || [],
            raw: parsedJobs,
          };
        } else {
          result = jobResult;
        }
        break;
        
      case "get_company":
        const companyResult = await callTool("search_engine", {
          query: `${query} company reviews ratings glassdoor`,
        });
        const parsedCompany = parseSearchResults(companyResult);
        result = parsedCompany || companyResult;
        shouldSummarize = true;
        break;
        
      case "get_salaries":
        const salaryQuery = location 
          ? `${query} salary in ${location}` 
          : `${query} salary`;
        
        const salaryResult = await callTool("search_engine", {
          query: salaryQuery,
        });
        const parsedSalary = parseSearchResults(salaryResult);
        result = parsedSalary || salaryResult;
        shouldSummarize = true;
        break;
        
      case "get_insights":
        // General job market queries - always summarize with AI
        const insightQuery = location 
          ? `${query} ${location}` 
          : query;
        
        const insightResult = await callTool("search_engine", {
          query: insightQuery,
        });
        const parsedInsights = parseSearchResults(insightResult);
        const summary = await summarizeWithAI(query, parsedInsights || insightResult);
        result = {
          summary,
          sources: parsedInsights?.organic?.slice(0, 5).map((item: { title?: string; link?: string; source?: string }) => ({
            title: item.title,
            url: item.link,
            source: item.source,
          })) || [],
        };
        break;
        
      case "scrape_url":
        result = await callTool("scrape_as_markdown", {
          url: query,
        });
        break;
        
      default:
        const defaultQuery = location 
          ? `${query} in ${location}` 
          : query;
        
        const defaultResult = await callTool("search_engine", {
          query: defaultQuery,
        });
        result = parseSearchResults(defaultResult) || defaultResult;
    }

    // Optionally summarize with AI for company/salary info
    if (shouldSummarize && result) {
      const summary = await summarizeWithAI(query, result);
      result = { summary, data: result };
    }

    console.log(`Job search completed successfully`);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Job search error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
