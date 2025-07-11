
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
      throw new Error('OpenAI API key not configured');
    }
    console.log('✅ OpenAI API key found');

    console.log('📥 Parsing request body...');
    const { message, personality, tasks, stats, context } = await req.json();
    console.log('📊 Request data:', { message, personality, stats });

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

    console.log('🤖 Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `${personalityPrompts[personality] || personalityPrompts.motivador}
            
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

    console.log('📡 OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI response received');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid OpenAI response format:', data);
      throw new Error('Invalid response format from OpenAI');
    }

    const aiResponse = data.choices[0].message.content;
    console.log('✅ AI response extracted:', aiResponse.substring(0, 100) + '...');

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('💥 Error in ai-chat function:', error);
    
    // Return a more detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Check the function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
