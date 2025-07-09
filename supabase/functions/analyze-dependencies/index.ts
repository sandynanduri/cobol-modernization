import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FileData {
  name: string;
  content: string;
}

interface DependencyAnalysis {
  hasDependencies: boolean;
  summary: string;
  dependencies: Array<{
    fromFile: string;
    toFile: string;
    dependencyType: string;
    description: string;
  }>;
  recommendations: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { files }: { files: FileData[] } = await req.json();

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No files provided for analysis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing dependencies for ${files.length} files`);

    // Create a comprehensive prompt for dependency analysis
    const filesContent = files.map(file => 
      `=== FILE: ${file.name} ===\n${file.content}\n\n`
    ).join('');

    const prompt = `
You are a COBOL expert analyzing file dependencies. Please analyze the following COBOL files to determine if they have dependencies on one another.

${filesContent}

Please provide a JSON response with the following structure:
{
  "hasDependencies": boolean,
  "summary": "Brief summary of the dependency analysis",
  "dependencies": [
    {
      "fromFile": "source file name",
      "toFile": "target file name", 
      "dependencyType": "COPY|CALL|FILE_REFERENCE|DATA_SHARING",
      "description": "Description of the dependency"
    }
  ],
  "recommendations": ["List of recommendations for handling these dependencies during conversion"]
}

Look for:
1. COPY statements that reference other files
2. CALL statements that invoke other programs
3. File references (ASSIGN, SELECT statements)
4. Shared data structures or variables
5. Include directives
6. Any other inter-file dependencies

If no dependencies are found between the files, set hasDependencies to false and provide an appropriate summary.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are a COBOL expert who analyzes code dependencies. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    console.log('OpenAI response:', analysisText);

    // Parse the JSON response from OpenAI
    let analysis: DependencyAnalysis;
    try {
      // Try to extract JSON from the response if it's wrapped in other text
      let jsonText = analysisText.trim();
      
      // Look for JSON block markers and extract content between them
      const jsonBlockMatch = jsonText.match(/```json\s*\n([\s\S]*?)\n```/);
      if (jsonBlockMatch) {
        jsonText = jsonBlockMatch[1].trim();
      } else {
        // Look for JSON content between curly braces
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
      }
      
      console.log('Extracted JSON:', jsonText);
      analysis = JSON.parse(jsonText);
      
      // Validate the structure
      if (!analysis.hasOwnProperty('hasDependencies') || !analysis.hasOwnProperty('summary')) {
        throw new Error('Invalid response structure');
      }
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw response was:', analysisText);
      
      // Try to create a basic analysis from the raw text
      const hasDeps = analysisText.toLowerCase().includes('dependencies') || 
                     analysisText.toLowerCase().includes('call') || 
                     analysisText.toLowerCase().includes('copy');
      
      analysis = {
        hasDependencies: hasDeps,
        summary: hasDeps ? 
          "Dependencies detected in the analysis response, but JSON parsing failed. Manual review recommended." :
          "No clear dependencies found in the analysis. The response could not be parsed as JSON.",
        dependencies: [],
        recommendations: ["Manual review required due to parsing error", "Check the edge function logs for the raw OpenAI response"]
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-dependencies function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        hasDependencies: false,
        summary: "Error occurred during dependency analysis",
        dependencies: [],
        recommendations: ["Please try again or review files manually"]
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});