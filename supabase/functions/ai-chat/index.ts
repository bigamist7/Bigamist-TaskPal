
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 [AI-CHAT] Function started');
  console.log('🔍 [AI-CHAT] Request method:', req.method);
  console.log('🔍 [AI-CHAT] Request URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ [AI-CHAT] CORS preflight handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check OpenAI API key first
    console.log('🔑 [AI-CHAT] Checking OpenAI API key...');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      console.error('❌ [AI-CHAT] OpenAI API key not found');
      return new Response(JSON.stringify({ 
        error: 'OPENAI_API_KEY not configured in Supabase secrets',
        debug: 'Check Edge Functions secrets in Supabase dashboard'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('✅ [AI-CHAT] OpenAI API key exists, length:', openAIApiKey.length);

    // Read and parse request body
    console.log('📥 [AI-CHAT] Reading request body...');
    let requestData;
    
    try {
      const bodyText = await req.text();
      console.log('📄 [AI-CHAT] Raw body length:', bodyText.length);
      console.log('📄 [AI-CHAT] Raw body preview:', bodyText.substring(0, 200));
      
      if (!bodyText || bodyText.trim() === '') {
        throw new Error('Request body is empty');
      }
      
      requestData = JSON.parse(bodyText);
      console.log('✅ [AI-CHAT] Request body parsed successfully');
      console.log('📊 [AI-CHAT] Parsed data keys:', Object.keys(requestData));
    } catch (parseError) {
      console.error('❌ [AI-CHAT] Failed to parse request body:', parseError.message);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        details: parseError.message,
        debug: 'Check if request body is valid JSON'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate required fields
    const { message, personality, tasks, stats, context } = requestData;
    console.log('🔍 [AI-CHAT] Validating fields...');
    console.log('🔍 [AI-CHAT] Message:', message ? `"${message.substring(0, 50)}..."` : 'MISSING');
    console.log('🔍 [AI-CHAT] Personality:', personality || 'MISSING');
    console.log('🔍 [AI-CHAT] Tasks count:', Array.isArray(tasks) ? tasks.length : 'NOT_ARRAY');
    console.log('🔍 [AI-CHAT] Stats:', stats ? 'PRESENT' : 'MISSING');

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      console.error('❌ [AI-CHAT] Message validation failed');
      return new Response(JSON.stringify({ 
        error: 'Message is required and must be a non-empty string',
        received: { message, type: typeof message },
        debug: 'Ensure message field contains text'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare OpenAI request
    console.log('🤖 [AI-CHAT] Preparing OpenAI request...');
    
    const personalityPrompts = {
      motivador: `Você é um assistente de produtividade extremamente motivador e energético! Use emojis e linguagem inspiradora. Seu objetivo é motivar o usuário a alcançar seus objetivos. Seja positivo, entusiástico e encoraje sempre. Dê dicas práticas de produtividade com energia contagiante.`,
      zen: `Você é um assistente de produtividade zen e mindful. Use uma linguagem calma, serena e reflexiva. Foque em equilíbrio, bem-estar e crescimento sustentável. Dê conselhos sobre produtividade de forma gentil e contemplativa, sempre considerando o bem-estar mental.`,
      profissional: `Você é um assistente de produtividade profissional e eficiente. Use linguagem clara, direta e estruturada. Foque em resultados, métricas e otimização. Dê conselhos práticos baseados em metodologias comprovadas de gestão de tempo e produtividade.`,
      brincalhao: `Você é um assistente de produtividade divertido e criativo! Use humor apropriado, metáforas divertidas e uma abordagem leve. Torne a produtividade algo prazeroso e gamificado. Seja espirituoso mas sempre útil.`
    };

    const systemPrompt = personalityPrompts[personality] || personalityPrompts.motivador;
    console.log('🎭 [AI-CHAT] Using personality:', personality);

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

    console.log('📤 [AI-CHAT] Calling OpenAI API...');
    console.log('📤 [AI-CHAT] Model:', openAIPayload.model);
    console.log('📤 [AI-CHAT] Messages count:', openAIPayload.messages.length);
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openAIPayload),
    });

    console.log('📡 [AI-CHAT] OpenAI response status:', openAIResponse.status);
    console.log('📡 [AI-CHAT] OpenAI response headers:', Object.fromEntries(openAIResponse.headers.entries()));

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('❌ [AI-CHAT] OpenAI API error:', {
        status: openAIResponse.status,
        statusText: openAIResponse.statusText,
        body: errorText.substring(0, 500)
      });
      
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${openAIResponse.status} ${openAIResponse.statusText}`,
        details: errorText.substring(0, 200),
        debug: 'Check OpenAI API key and account status'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIData = await openAIResponse.json();
    console.log('✅ [AI-CHAT] OpenAI response received');
    console.log('📊 [AI-CHAT] Response data keys:', Object.keys(openAIData));
    
    if (!openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
      console.error('❌ [AI-CHAT] Invalid OpenAI response format:', openAIData);
      return new Response(JSON.stringify({ 
        error: 'Invalid response format from OpenAI',
        received: openAIData,
        debug: 'OpenAI response structure is unexpected'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = openAIData.choices[0].message.content;
    console.log('✅ [AI-CHAT] AI response extracted, length:', aiResponse?.length);
    console.log('📝 [AI-CHAT] AI response preview:', aiResponse?.substring(0, 100));

    const successResponse = { response: aiResponse };
    console.log('📤 [AI-CHAT] Sending success response');

    return new Response(JSON.stringify(successResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 [AI-CHAT] Unexpected error:', error.message);
    console.error('💥 [AI-CHAT] Error stack:', error.stack);
    
    const errorResponse = { 
      error: `Function error: ${error.message}`,
      debug: 'Check the function logs for more information',
      stack: error.stack?.substring(0, 500)
    };
    
    console.log('📤 [AI-CHAT] Sending error response');
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
