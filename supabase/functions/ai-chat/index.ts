
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🔄 AI Chat function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔑 Checking OpenAI API key...');
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not found in environment');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        details: 'OPENAI_API_KEY environment variable is missing'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('✅ OpenAI API key found, length:', openAIApiKey.length);

    console.log('📥 Reading request body...');
    let requestData;
    try {
      const requestText = await req.text();
      console.log('📄 Raw request received, length:', requestText.length);
      console.log('📄 Raw request body:', requestText.substring(0, 200) + '...');
      
      if (!requestText.trim()) {
        throw new Error('Empty request body');
      }
      
      requestData = JSON.parse(requestText);
      console.log('✅ Request parsed successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse request JSON:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        details: parseError.message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, personality, tasks, stats, context } = requestData;
    console.log('📊 Extracted data:', { 
      hasMessage: !!message, 
      messageLength: message?.length,
      personality, 
      tasksCount: tasks?.length || 0,
      statsPresent: !!stats
    });

    // Validate required fields
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      console.error('❌ Invalid or missing message');
      return new Response(JSON.stringify({ 
        error: 'Message is required and must be a non-empty string',
        received: { message, type: typeof message }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Define personality prompts
    const personalityPrompts = {
      motivador: `Você é um assistente de produtividade extremamente motivador e energético! Use emojis e linguagem inspiradora. Seu objetivo é motivar o usuário a alcançar seus objetivos. Seja positivo, entusiástico e encoraje sempre. Dê dicas práticas de produtividade com energia contagiante.`,
      zen: `Você é um assistente de produtividade zen e mindful. Use uma linguagem calma, serena e reflexiva. Foque em equilíbrio, bem-estar e crescimento sustentável. Dê conselhos sobre produtividade de forma gentil e contemplativa, sempre considerando o bem-estar mental.`,
      profissional: `Você é um assistente de produtividade profissional e eficiente. Use linguagem clara, direta e estruturada. Foque em resultados, métricas e otimização. Dê conselhos práticos baseados em metodologias comprovadas de gestão de tempo e produtividade.`,
      brincalhao: `Você é um assistente de produtividade divertido e criativo! Use humor apropriado, metáforas divertidas e uma abordagem leve. Torne a produtividade algo prazeroso e gamificado. Seja espirituoso mas sempre útil.`
    };

    const systemPrompt = personalityPrompts[personality] || personalityPrompts.motivador;
    console.log('🎭 Using personality:', personality);

    // Prepare context
    const contextInfo = `
Informações do usuário:
- Total de tarefas: ${stats?.totalTasks || 0}
- Tarefas concluídas: ${stats?.completedTasks || 0}
- Taxa de conclusão: ${stats?.completionRate?.toFixed(1) || 0}%
- Sequência atual: ${stats?.streak || 0} dias
- Tarefas ativas: ${tasks?.length || 0}

Contexto da conversa: ${context || 'Nova conversa'}
`;

    const openAIPayload = {
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: `${systemPrompt}
          
          Você é especialista em produtividade e gestão de tarefas. Ajude o usuário com:
          - Organização de tarefas e priorização
          - Técnicas de produtividade (Pomodoro, GTD, etc.)
          - Motivação e foco
          - Análise de progresso
          - Sugestões personalizadas
          
          Sempre responda em português brasileiro. Seja conciso mas útil.
          
          ${contextInfo}`
        },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    };

    console.log('🤖 Calling OpenAI API...');
    console.log('📤 OpenAI payload:', JSON.stringify(openAIPayload, null, 2));
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openAIPayload),
    });

    console.log('📡 OpenAI response status:', openAIResponse.status);
    console.log('📡 OpenAI response headers:', Object.fromEntries(openAIResponse.headers.entries()));

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('❌ OpenAI API error:', {
        status: openAIResponse.status,
        statusText: openAIResponse.statusText,
        body: errorText
      });
      
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${openAIResponse.status} ${openAIResponse.statusText}`,
        details: errorText,
        apiKeyLength: openAIApiKey.length
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIData = await openAIResponse.json();
    console.log('✅ OpenAI response received:', JSON.stringify(openAIData, null, 2));
    
    if (!openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
      console.error('❌ Invalid OpenAI response format');
      return new Response(JSON.stringify({ 
        error: 'Invalid response format from OpenAI',
        received: openAIData
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = openAIData.choices[0].message.content;
    console.log('✅ AI response extracted, length:', aiResponse?.length);

    const successResponse = { response: aiResponse };
    console.log('📤 Sending success response:', JSON.stringify(successResponse));

    return new Response(JSON.stringify(successResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Unexpected error in ai-chat function:', error);
    console.error('💥 Error stack:', error.stack);
    
    const errorResponse = { 
      error: `Function error: ${error.message}`,
      details: 'Check the function logs for more information',
      stack: error.stack
    };
    
    console.log('📤 Sending error response:', JSON.stringify(errorResponse));
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
