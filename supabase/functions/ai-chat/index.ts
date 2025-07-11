
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
      console.error('❌ OpenAI API key not found');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        details: 'Please configure the OPENAI_API_KEY in Supabase Edge Functions secrets'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('✅ OpenAI API key found');

    console.log('📥 Parsing request body...');
    let requestData;
    try {
      requestData = await req.json();
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
    console.log('📊 Request data received:', { 
      message: message?.substring(0, 50) + '...',
      personality, 
      tasksCount: tasks?.length || 0,
      stats 
    });

    // Validate required fields
    if (!message) {
      console.error('❌ Message is required');
      return new Response(JSON.stringify({ 
        error: 'Message is required',
        details: 'The message field cannot be empty'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Define personality-specific system prompts
    const personalityPrompts = {
      motivador: `Você é um assistente de produtividade extremamente motivador e energético! Use emojis e linguagem inspiradora. Seu objetivo é motivar o usuário a alcançar seus objetivos. Seja positivo, entusiástico e encoraje sempre. Dê dicas práticas de produtividade com energia contagiante.`,
      
      zen: `Você é um assistente de produtividade zen e mindful. Use uma linguagem calma, serena e reflexiva. Foque em equilíbrio, bem-estar e crescimento sustentável. Dê conselhos sobre produtividade de forma gentil e contemplativa, sempre considerando o bem-estar mental.`,
      
      profissional: `Você é um assistente de produtividade profissional e eficiente. Use linguagem clara, direta e estruturada. Foque em resultados, métricas e otimização. Dê conselhos práticos baseados em metodologias comprovadas de gestão de tempo e produtividade.`,
      
      brincalhao: `Você é um assistente de produtividade divertido e criativo! Use humor apropriado, metáforas divertidas e uma abordagem leve. Torne a produtividade algo prazeroso e gamificado. Seja espirituoso mas sempre útil.`
    };

    // Prepare context about user's current state
    const contextInfo = `
Informações do usuário:
- Total de tarefas: ${stats?.totalTasks || 0}
- Tarefas concluídas: ${stats?.completedTasks || 0}
- Taxa de conclusão: ${stats?.completionRate?.toFixed(1) || 0}%
- Sequência atual: ${stats?.streak || 0} dias
- Tarefas ativas: ${tasks?.length || 0}

Contexto da conversa: ${context || 'Nova conversa'}
`;

    const systemPrompt = personalityPrompts[personality] || personalityPrompts.motivador;

    console.log('🤖 Calling OpenAI API...');
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      }),
    });

    console.log('📡 OpenAI response status:', openAIResponse.status);

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('❌ OpenAI API error:', openAIResponse.status, errorText);
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${openAIResponse.status}`,
        details: errorText
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIData = await openAIResponse.json();
    console.log('✅ OpenAI response received');
    
    if (!openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
      console.error('❌ Invalid OpenAI response format:', openAIData);
      return new Response(JSON.stringify({ 
        error: 'Invalid response format from OpenAI',
        details: 'The AI response does not contain the expected message structure'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = openAIData.choices[0].message.content;
    console.log('✅ AI response extracted:', aiResponse.substring(0, 100) + '...');

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in ai-chat function:', error);
    
    // Return a more detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(JSON.stringify({ 
      error: `Function error: ${errorMessage}`,
      details: 'Check the function logs for more information',
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
