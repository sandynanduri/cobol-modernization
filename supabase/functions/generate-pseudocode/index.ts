import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface FileData {
  name: string;
  content: string;
}

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
    const { files }: { files: FileData[] } = await req.json();
    
    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: 'No files provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Construct the prompt with actual file contents
    let filesContent = '';
    files.forEach(file => {
      filesContent += `\n\n=== ${file.name.toUpperCase()} ===\n${file.content}\n`;
    });

    const prompt = `You are an expert COBOL analyst, solution architect, and business logic documentation specialist.

Your task is to read the following COBOL program files and produce **detailed, clear, and structured pseudocode** that captures:

1. **File-wise functionality**
   - For each file (main program, subprogram, copybook), describe what it does.
2. **Step-by-step processing logic**
   - Break down each paragraph, procedure, or section into simple pseudocode steps.
3. **Data structures**
   - Describe key data structures, copybooks, and working-storage variables used.
4. **Input/Output flow**
   - Inputs (parameters, files read)
   - Outputs (files written, displays, parameters returned)
5. **Business calculations and rules**
   - Explain formulas and thresholds in clear words.
6. **Program interactions**
   - Describe which program calls which subprograms and for what purpose.
7. **Dependencies**
   - Specify included copybooks, called subprograms, and their role.

Here are the COBOL files:
${filesContent}

Instructions:

- Write structured pseudocode with program-wise headings.  
- Use clear, professional language suitable for system design documentation.  
- Do not skip any processing logic or business rules; ensure **100% coverage**.  
- Do not include COBOL code; only explain logic in pseudocode and plain English steps.

Begin your **deep and accurate analysis now**.`;

    console.log('Calling OpenAI API for pseudo-code generation...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${response.status}`,
        details: errorText 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error('No choices returned from OpenAI');
      return new Response(JSON.stringify({ error: 'No response generated' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pseudocode = data.choices[0].message.content;
    console.log('Pseudo-code generated successfully');

    return new Response(JSON.stringify({ 
      pseudocode,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-pseudocode function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});