
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
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: userMessage,
          personality,
          tasks,
          stats,
          context: this.conversationHistory.join('\n')
        }
      });

      console.log('📡 Resposta da função edge:', { data, error });

      if (error) {
        console.error('❌ Erro na função AI:', error);
        throw new Error(`Erro na função AI: ${error.message}`);
      }

      if (!data) {
        console.error('❌ Dados não recebidos da função AI');
        throw new Error('Nenhum dado recebido da função AI');
      }

      if (data.error) {
        console.error('❌ Erro retornado pela função AI:', data.error);
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
    
    // Check if it's an API key issue
    if (error?.message?.includes('API key') || error?.message?.includes('401')) {
      return '🔑 Parece que há um problema com a configuração da API key do OpenAI. Verifique se a chave foi configurada corretamente no Supabase.';
    }
    
    // Check if it's a network issue
    if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
      return '🌐 Problema de conexão detectado. Verifique sua internet e tente novamente em alguns segundos.';
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
