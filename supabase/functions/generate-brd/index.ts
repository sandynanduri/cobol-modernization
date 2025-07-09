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
  console.log('BRD function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Parsing request body...');
    const requestBody = await req.text();
    console.log('Request body:', requestBody);
    
    const { files } = JSON.parse(requestBody) as { files: FileData[] };

    if (!files || files.length === 0) {
      console.error('No files provided in request');
      return new Response(
        JSON.stringify({ error: 'No files provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Files received:', files.length);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('OpenAI API key found, creating prompt...');

    // Create the detailed prompt with actual COBOL content
    const cobolContent = files.map(file => `
=== FILE: ${file.name} ===
${file.content}
===============================
`).join('\n');

    const prompt = `You are an experienced COBOL business analyst and documentation specialist with a strong background in banking, insurance, and financial systems.

Your task is to read the following COBOL program(s) and produce a **Business Requirements Document (BRD)** with **extremely detailed and structured business logic analysis**.

Here is the COBOL code:

${cobolContent}

Follow these instructions carefully to ensure your output is **100% accurate, comprehensive, and does not miss a single detail**:

1. Identify the **program name** from PROGRAM-ID and mention it clearly.
2. Determine **precisely** if this is a **main program, subprogram, or copybook** and explain why.
3. Summarize the **high-level purpose** of the program in **2-3 clear sentences**.
4. Identify **all inputs**, specifying:
   - Files read (with file names and purpose)
   - Input parameters (linkage section variables)
   - Working-storage variables used as inputs
   - Any constants or hardcoded input values used in calculations
5. Identify **all outputs**, specifying:
   - Files written or updated (with file names and purpose)
   - Display outputs (each display message and its business meaning)
   - Output parameters returned to calling programs or external systems
6. Break down the **entire business logic step by step**, explaining:
   - The flow of operations in the program
   - All calculations performed, with context and business meaning
   - All validations performed, their purpose, and consequences of failure
   - All decision logic and branching conditions, explained in plain business terms
   - Any looping or iterative processing and its purpose
7. Extract and clearly document all **business rules**, including:
   - Thresholds
   - Constants
   - Rates
   - Conditions or special cases handled
   - Any regulatory or domain rules inferred from the logic
8. Identify **dependencies**:
   - All copybooks included (with their purpose and brief content summary if visible)
   - All subprograms or external modules called (with their purpose)
9. Compile this into a **formal Business Requirements Document (BRD)** with the following clearly labelled sections:

[Program Overview], [Business Context], [Inputs], [Processing Logic], [Outputs], [Business Rules], [Dependencies], [Assumptions & Notes].

Ensure your BRD is:

- **Elaborate and exhaustive**, covering every aspect of the program  
- Written in **clear, concise, and professional business language** suitable for banking or financial services documentation  
- Structured with **well-formatted headings, subheadings, and bullet points** for readability  
- Free of COBOL code snippets; instead explain in **pure business and functional terms**  
- Free of assumptions that are not backed by the code (only document what is clearly visible or logically inferred)

Finally, ensure the output is **detailed enough that a business analyst, developer, or tester can understand exactly what this program does, why it exists, and how it interacts with other components without needing to read the code itself**.

Begin your **deep and accurate analysis now**.`;

    console.log('Calling OpenAI API...');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert COBOL business analyst specializing in creating comprehensive Business Requirements Documents for financial and enterprise systems.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 4000
      }),
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${response.status} - ${errorData}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('OpenAI API success, extracting BRD...');
    
    const brd = data.choices[0].message.content;

    console.log('BRD generated successfully, returning response');

    return new Response(
      JSON.stringify({ 
        brd,
        filesAnalyzed: files.length,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-brd function:', error);
    return new Response(
      JSON.stringify({ error: `Internal error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});