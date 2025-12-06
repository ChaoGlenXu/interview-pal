import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TADATA_API_KEY = Deno.env.get("TADATA_API_KEY");
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
  console.log(`MCP response:`, JSON.stringify(result));
  
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, location, filters } = await req.json();
    
    console.log(`Job search request: action=${action}, query=${query}, location=${location}`);
    
    let result;

    switch (action) {
      case "list_tools":
        // List available MCP tools
        result = await mcpCall("tools/list", {});
        break;
        
      case "search_jobs":
        // Use search_engine tool to search for jobs
        const jobSearchQuery = location 
          ? `${query} jobs in ${location}` 
          : `${query} jobs`;
        
        result = await callTool("search_engine", {
          query: jobSearchQuery,
          engine: "google",
          count: filters?.limit || 20,
        });
        break;
        
      case "get_company":
        // Search for company information
        result = await callTool("search_engine", {
          query: `${query} company reviews ratings glassdoor`,
          engine: "google",
          count: 10,
        });
        break;
        
      case "get_salaries":
        // Search for salary information
        const salaryQuery = location 
          ? `${query} salary in ${location}` 
          : `${query} salary`;
        
        result = await callTool("search_engine", {
          query: salaryQuery,
          engine: "google",
          count: 10,
        });
        break;
        
      case "scrape_url":
        // Scrape a specific URL for job details
        result = await callTool("scrape_as_markdown", {
          url: query,
        });
        break;
        
      default:
        // Default: try search_engine for job search
        const defaultQuery = location 
          ? `${query} in ${location}` 
          : query;
        
        result = await callTool("search_engine", {
          query: defaultQuery,
          engine: "google",
          count: filters?.limit || 20,
        });
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
