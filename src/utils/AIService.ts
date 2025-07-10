import { PersonalityType } from '../contexts/ChatContext';
import { Task, TaskStats } from '../contexts/TaskContext';

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

      const response = await fetch('https://xwirgxwigptnyccqgkqi.supabase.co/functions/v1/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3aXJneHdpd2dwdG55Y3Fna3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTQzNjEsImV4cCI6MjA2NzczMDM2MX0.tPKH7VhrUfvZu6E1YHDdFByLUmbQbPhqtGasK_9B0Us`
        },
        body: JSON.stringify({
          message: userMessage,
          personality,
          tasks,
          stats,
          context: this.conversationHistory.join('\n')
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
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
