import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface FileData {
  name: string;
  content: string;
}

interface ConversionRequest {
  files: FileData[];
  businessLogic: string;
  pseudoCode: string;
  targetLanguage: string;
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
    const { files, businessLogic, pseudoCode, targetLanguage }: ConversionRequest = await req.json();
    
    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: 'No files provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!businessLogic || !pseudoCode || !targetLanguage) {
      return new Response(JSON.stringify({ error: 'Missing required parameters: businessLogic, pseudoCode, or targetLanguage' }), {
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

    // Construct the files content
    let filesContent = '';
    files.forEach(file => {
      filesContent += `\n\n=== ${file.name.toUpperCase()} ===\n${file.content}\n`;
    });

    const prompt = `You are an expert software developer and COBOL conversion specialist.

Your task is to convert the following COBOL program files into **full ${targetLanguage} code** that implements the same logic.

## CONVERSION REQUIREMENTS:

✔ **Use the Business Requirements Document (BRD) as your specification** - ensure all business rules are preserved
✔ **Follow the pseudo-code structure exactly** - the final code must match the pseudo-code step by step
✔ **Implement 100% of the COBOL logic** - do not skip any functionality
✔ **Make the code production-ready** - include proper error handling, validation, and structure
✔ **Use clear comments** to indicate:
   - Business logic step being implemented
   - Any constants, thresholds, or special business rules used
   - Mapping from original COBOL functionality

## BUSINESS REQUIREMENTS DOCUMENT (BRD):
${businessLogic}

## PSEUDO CODE TO IMPLEMENT:
${pseudoCode}

## ORIGINAL COBOL FILES:
${filesContent}

## TARGET LANGUAGE: ${targetLanguage}

## CONVERSION INSTRUCTIONS:

1. **Structure Analysis**: Analyze the BRD and pseudo-code to understand the complete business logic flow
2. **Data Structure Mapping**: Convert COBOL data structures (PIC clauses, copybooks) to equivalent ${targetLanguage} structures
3. **Logic Implementation**: Implement each pseudo-code step as ${targetLanguage} code, ensuring business rules are preserved
4. **Error Handling**: Add appropriate error handling and validation as specified in the BRD
5. **Constants & Thresholds**: Implement all business constants and thresholds mentioned in the BRD
6. **Program Flow**: Maintain the same program flow and procedure calls as described in the pseudo-code
7. **Comments**: Add comprehensive comments explaining the business logic being implemented

## OUTPUT REQUIREMENTS:

- **Complete ${targetLanguage} code** that can be compiled/run immediately
- **Exact pseudo-code implementation** - every step must be represented in code
- **All business rules preserved** from the BRD
- **Production-ready quality** with proper structure and error handling
- **Clear documentation** through comments

Generate the complete, production-ready ${targetLanguage} code now:`;

    console.log('Calling OpenAI API for code conversion...');
    
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
        temperature: 0.2,
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

    const convertedCode = data.choices[0].message.content;
    console.log('Code conversion generated successfully');

    return new Response(JSON.stringify({ 
      convertedCode,
      targetLanguage,
      filesProcessed: files.length,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in convert-to-target-language function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});