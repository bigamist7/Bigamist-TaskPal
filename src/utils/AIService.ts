
import { PersonalityType } from '../contexts/ChatContext';
import { Task, TaskStats } from '../contexts/TaskContext';
import { supabase } from '../integrations/supabase/client';

export class AIService {
  private static instance: AIService;
  private conversationHistory: string[] = [];

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateResponse(
    userMessage: string,
    personality: PersonalityType,
    tasks: Task[],
    stats: TaskStats
  ): Promise<string> {
    try {
      console.log('🤖 AIService: Iniciando geração de resposta...');
      console.log('📝 Mensagem do usuário:', userMessage);
      console.log('🎭 Personalidade:', personality);
      console.log('📊 Stats:', stats);
      
      // Add to conversation history
      this.conversationHistory.push(`User: ${userMessage}`);
      
      // Keep only last 10 messages for context
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      console.log('🔄 Chamando função edge ai-chat...');
      
      const requestBody = {
        message: userMessage,
        personality,
        tasks,
        stats,
        context: this.conversationHistory.join('\n')
      };

      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: requestBody
      });

      console.log('📡 Resposta da função edge:', { data, error });

      if (error) {
        console.error('❌ Erro na função AI:', error);
        
        // Check for specific error types
        if (error.message?.includes('not found') || error.message?.includes('404')) {
          throw new Error('Função AI não encontrada. Verifique se a função edge foi implantada corretamente.');
        }
        
        if (error.message?.includes('timeout') || error.message?.includes('504')) {
          throw new Error('Timeout: A função AI demorou muito para responder. Tente novamente.');
        }
        
        throw new Error(`Erro na função AI: ${error.message}`);
      }

      if (!data) {
        console.error('❌ Dados não recebidos da função AI');
        throw new Error('Nenhum dado recebido da função AI');
      }

      if (data.error) {
        console.error('❌ Erro retornado pela função AI:', data.error);
        
        // Handle specific OpenAI errors
        if (data.error.includes('API key')) {
          throw new Error('Problema com a chave da API OpenAI. Verifique se a chave está configurada corretamente no Supabase.');
        }
        
        if (data.error.includes('rate limit') || data.error.includes('429')) {
          throw new Error('Limite de uso da API OpenAI atingido. Tente novamente em alguns minutos.');
        }
        
        if (data.error.includes('quota') || data.error.includes('billing')) {
          throw new Error('Cota da API OpenAI esgotada. Verifique sua conta OpenAI.');
        }
        
        throw new Error(`Erro da função AI: ${data.error}`);
      }

      if (!data.response) {
        console.error('❌ Resposta inválida da função AI:', data);
        throw new Error('Resposta inválida da função AI');
      }

      const aiResponse = data.response;
      console.log('✅ Resposta da IA recebida:', aiResponse);

      // Add AI response to history
      this.conversationHistory.push(`Assistant: ${aiResponse}`);

      return aiResponse;
    } catch (error) {
      console.error('💥 Erro completo no AIService:', error);
      
      // Fallback to simple response if AI fails
      return this.getFallbackResponse(personality, error);
    }
  }

  private getFallbackResponse(personality: PersonalityType, error?: any): string {
    console.log('🔄 Usando resposta de fallback para personalidade:', personality);
    
    // Check for specific error types
    if (error?.message?.includes('API key') || error?.message?.includes('OpenAI')) {
      return '🔑 Há um problema com a configuração da API key do OpenAI. Verifique se a chave foi configurada corretamente no Supabase Edge Functions.';
    }
    
    if (error?.message?.includes('timeout') || error?.message?.includes('Timeout')) {
      return '⏰ A IA está demorando muito para responder. Tente uma pergunta mais simples ou aguarde alguns segundos antes de tentar novamente.';
    }
    
    if (error?.message?.includes('fetch') || error?.message?.includes('network') || error?.message?.includes('conexão')) {
      return '🌐 Problema de conexão detectado. Verifique sua internet e tente novamente em alguns segundos.';
    }
    
    if (error?.message?.includes('não encontrada') || error?.message?.includes('404')) {
      return '🔧 Há um problema técnico com a função de IA. Entre em contato com o suporte técnico.';
    }
    
    const fallbacks = {
      motivador: '💪 Desculpe, tive um problema técnico temporário. Mas estou aqui para te ajudar! Como posso te motivar hoje?',
      zen: '🧘‍♀️ Algo deu errado, mas mantenha a calma. Respire fundo e me conte como posso ajudar.',
      profissional: '⚡ Ocorreu um erro técnico. Como posso ajudar você a ser mais produtivo?',
      brincalhao: '🎪 Ops! Algo deu errado, mas não desanime! Como posso tornar seu dia mais divertido?'
    };

    return fallbacks[personality] || fallbacks.motivador;
  }

  clearHistory() {
    this.conversationHistory = [];
    console.log('🗑️ Histórico de conversa limpo');
  }
}
