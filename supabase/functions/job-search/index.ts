import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TADATA_SERVER_URL = "https://brightdata-rkc5.mcp.tadata.com";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, location, filters } = await req.json();
    
    console.log(`Job search request: action=${action}, query=${query}, location=${location}`);
    
    let endpoint = "";
    let requestBody: Record<string, unknown> = {};

    switch (action) {
      case "search_jobs":
        endpoint = "/search/jobs";
        requestBody = {
          query: query || "",
          location: location || "",
          limit: filters?.limit || 20,
          page: filters?.page || 1,
        };
        break;
        
      case "get_company":
        endpoint = "/company";
        requestBody = {
          company_name: query,
          include_reviews: filters?.includeReviews || true,
          include_ratings: filters?.includeRatings || true,
        };
        break;
        
      case "get_salaries":
        endpoint = "/salaries";
        requestBody = {
          job_title: query,
          location: location || "",
          experience_level: filters?.experienceLevel || "",
        };
        break;
        
      case "get_job_details":
        endpoint = "/job";
        requestBody = {
          job_url: query,
        };
        break;
        
      default:
        // Default to job search
        endpoint = "/search/jobs";
        requestBody = {
          query: query || "",
          location: location || "",
          limit: 20,
        };
    }

    console.log(`Calling Tadata API: ${TADATA_SERVER_URL}${endpoint}`);
    console.log(`Request body:`, JSON.stringify(requestBody));

    const response = await fetch(`${TADATA_SERVER_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Tadata API error: ${response.status} - ${errorText}`);
      
      return new Response(
        JSON.stringify({ 
          error: `Tadata API error: ${response.status}`,
          details: errorText 
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const data = await response.json();
    console.log(`Tadata API response received successfully`);

    return new Response(
      JSON.stringify({ success: true, data }),
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
