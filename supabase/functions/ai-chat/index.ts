
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
    // Check API keys first
    console.log('🔑 [AI-CHAT] Checking API keys...');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!openAIApiKey) {
      console.error('❌ [AI-CHAT] OpenAI API key not found');
      return new Response(JSON.stringify({ 
        error: 'OPENAI_API_KEY not configured in Supabase secrets',
        debug: 'Check Edge Functions secrets in Supabase dashboard'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!perplexityApiKey) {
      console.error('❌ [AI-CHAT] Perplexity API key not found');
      return new Response(JSON.stringify({ 
        error: 'PERPLEXITY_API_KEY not configured in Supabase secrets',
        debug: 'Check Edge Functions secrets in Supabase dashboard'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('✅ [AI-CHAT] API keys exist');

    // Read and parse request body
    console.log('📥 [AI-CHAT] Reading request body...');
    let requestData;
    
    try {
      const bodyText = await req.text();
      console.log('📄 [AI-CHAT] Raw body length:', bodyText.length);
      
      if (!bodyText || bodyText.trim() === '') {
        console.error('❌ [AI-CHAT] Empty request body');
        return new Response(JSON.stringify({ 
          error: 'Request body is empty',
          debug: 'Ensure request body contains valid JSON'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      requestData = JSON.parse(bodyText);
      console.log('✅ [AI-CHAT] Request body parsed successfully');
      console.log('📊 [AI-CHAT] Parsed data keys:', Object.keys(requestData || {}));
    } catch (parseError) {
      console.error('❌ [AI-CHAT] Failed to parse request body:', parseError.message);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        details: parseError.message,
        debug: 'Check if request body is valid JSON'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate required fields
    const { message, personality, tasks, stats, context } = requestData || {};
    console.log('🔍 [AI-CHAT] Validating fields...');
    console.log('📝 [AI-CHAT] Message:', message);
    console.log('🎭 [AI-CHAT] Personality:', personality);

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      console.error('❌ [AI-CHAT] Message validation failed');
      return new Response(JSON.stringify({ 
        error: 'Message is required and must be a non-empty string',
        received: { message, type: typeof message },
        debug: 'Ensure message field contains text'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if message needs real-time information
    const needsRealTimeInfo = checkIfNeedsRealTimeInfo(message);
    console.log('🌐 [AI-CHAT] Needs real-time info:', needsRealTimeInfo);

    let aiResponse;

    try {
      if (needsRealTimeInfo) {
        console.log('🔍 [AI-CHAT] Using Perplexity for real-time information...');
        aiResponse = await getPerplexityResponse(message, personality || 'motivador', perplexityApiKey);
      } else {
        console.log('🤖 [AI-CHAT] Using OpenAI for general productivity chat...');
        aiResponse = await getOpenAIResponse(message, personality || 'motivador', tasks || [], stats || {}, context || '', openAIApiKey);
      }

      console.log('✅ [AI-CHAT] AI response received, length:', aiResponse?.length);

      if (!aiResponse) {
        console.error('❌ [AI-CHAT] Empty AI response');
        return new Response(JSON.stringify({ 
          error: 'Empty response from AI service',
          debug: 'AI service returned null or undefined response'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const successResponse = { response: aiResponse };
      console.log('📤 [AI-CHAT] Sending success response');

      return new Response(JSON.stringify(successResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (aiError) {
      console.error('❌ [AI-CHAT] AI service error:', aiError.message);
      console.error('❌ [AI-CHAT] AI error stack:', aiError.stack);
      
      return new Response(JSON.stringify({ 
        error: `AI service error: ${aiError.message}`,
        debug: 'Error occurred while calling AI service',
        service: needsRealTimeInfo ? 'Perplexity' : 'OpenAI'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function checkIfNeedsRealTimeInfo(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Keywords that indicate need for current information
  const currentInfoKeywords = [
    'atual', 'atualmente', 'agora', 'hoje', 'recente', 'último', 'nova', 'novo',
    'presidente', 'eleição', 'política', 'notícias', 'acontecendo',
    'current', 'now', 'today', 'recent', 'latest', 'news', 'president',
    'clima', 'weather', 'cotação', 'preço', 'bolsa', 'stock', 'quem é o presidente'
  ];
  
  return currentInfoKeywords.some(keyword => lowerMessage.includes(keyword));
}

async function getPerplexityResponse(message: string, personality: string, apiKey: string): Promise<string> {
  const personalityPrompts = {
    motivador: 'Responda de forma motivadora e energética com emojis. ',
    zen: 'Responda de forma calma e equilibrada. ',
    profissional: 'Responda de forma direta e profissional. ',
    brincalhao: 'Responda de forma divertida e descontraída. '
  };

  const systemPrompt = (personalityPrompts[personality] || personalityPrompts.motivador) + 
    'Forneça informações atuais e precisas. Sempre responda em português brasileiro.';

  // Use a valid Perplexity model - llama-3.1-sonar-small-128k-online is the correct one
  const perplexityPayload = {
    model: 'llama-3.1-sonar-small-128k-online',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ]
  };

  console.log('📤 [AI-CHAT] Calling Perplexity API...');

  const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(perplexityPayload),
  });

  console.log('📡 [AI-CHAT] Perplexity response status:', perplexityResponse.status);

  if (!perplexityResponse.ok) {
    const errorText = await perplexityResponse.text();
    console.error('❌ [AI-CHAT] Perplexity API error:', errorText);
    throw new Error(`Perplexity API error: ${perplexityResponse.status} - ${errorText}`);
  }

  const perplexityData = await perplexityResponse.json();
  
  if (!perplexityData.choices || !perplexityData.choices[0] || !perplexityData.choices[0].message) {
    console.error('❌ [AI-CHAT] Invalid Perplexity response format:', perplexityData);
    throw new Error('Invalid response format from Perplexity');
  }

  return perplexityData.choices[0].message.content;
}

async function getOpenAIResponse(message: string, personality: string, tasks: any[], stats: any, context: string, apiKey: string): Promise<string> {
  const personalityPrompts = {
    motivador: `Você é um assistente de produtividade extremamente motivador e energético! Use emojis e linguagem inspiradora. Seu objetivo é motivar o usuário a alcançar seus objetivos. Seja positivo, entusiástico e encoraje sempre. Dê dicas práticas de produtividade com energia contagiante.`,
    zen: `Você é um assistente de produtividade zen e mindful. Use uma linguagem calma, serena e reflexiva. Foque em equilíbrio, bem-estar e crescimento sustentável. Dê conselhos sobre produtividade de forma gentil e contemplativa, sempre considerando o bem-estar mental.`,
    profissional: `Você é um assistente de produtividade profissional e eficiente. Use linguagem clara, direta e estruturada. Foque em resultados, métricas e otimização. Dê conselhos práticos baseados em metodologias comprovadas de gestão de tempo e produtividade.`,
    brincalhao: `Você é um assistente de produtividade divertido e criativo! Use humor apropriado, metáforas divertidas e uma abordagem leve. Torne a produtividade algo prazeroso e gamificado. Seja espirituoso mas sempre útil.`
  };

  const systemPrompt = personalityPrompts[personality] || personalityPrompts.motivador;

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
  
  const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(openAIPayload),
  });

  console.log('📡 [AI-CHAT] OpenAI response status:', openAIResponse.status);

  if (!openAIResponse.ok) {
    const errorText = await openAIResponse.text();
    console.error('❌ [AI-CHAT] OpenAI API error:', errorText);
    throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
  }

  const openAIData = await openAIResponse.json();
  
  if (!openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
    console.error('❌ [AI-CHAT] Invalid OpenAI response format:', openAIData);
    throw new Error('Invalid response format from OpenAI');
  }

  return openAIData.choices[0].message.content;
}
