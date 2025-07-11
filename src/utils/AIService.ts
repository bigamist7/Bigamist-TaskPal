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
      // Add to conversation history
      this.conversationHistory.push(`User: ${userMessage}`);
      
      // Keep only last 10 messages for context
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: userMessage,
          personality,
          tasks,
          stats,
          context: this.conversationHistory.join('\n')
        }
      });

      if (error) {
        throw new Error(`Erro na função AI: ${error.message}`);
      }

      const aiResponse = data.response;

      // Add AI response to history
      this.conversationHistory.push(`Assistant: ${aiResponse}`);

      return aiResponse;
    } catch (error) {
      console.error('Erro ao gerar resposta da IA:', error);
      
      // Fallback to simple response if AI fails
      return this.getFallbackResponse(personality);
    }
  }

  private getFallbackResponse(personality: PersonalityType): string {
    const fallbacks = {
      motivador: '💪 Desculpe, tive um problema técnico. Mas estou aqui para te ajudar! Como posso te motivar hoje?',
      zen: '🧘‍♀️ Algo deu errado, mas mantenha a calma. Respire fundo e me conte como posso ajudar.',
      profissional: '⚡ Ocorreu um erro técnico. Como posso ajudar você a ser mais produtivo?',
      brincalhao: '🎪 Ops! Algo deu errado, mas não desanime! Como posso tornar seu dia mais divertido?'
    };

    return fallbacks[personality] || fallbacks.motivador;
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}
