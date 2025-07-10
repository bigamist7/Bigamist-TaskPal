
import { PersonalityType } from '../contexts/ChatContext';
import { Task, TaskStats } from '../contexts/TaskContext';

export class ChatBot {
  private personalities = {
    motivador: {
      greetings: ['💪 Vamos lá!', '🔥 Você consegue!', '⚡ Energia total!'],
      taskComplete: [
        '🎉 Incrível! Mais uma conquista! Continue assim!',
        '🌟 Parabéns! Você está arrasando hoje!',
        '💥 Sensacional! Seu foco é inspirador!'
      ],
      tips: [
        '💡 Dica: Comece pelas tarefas mais difíceis quando sua energia está alta!',
        '🎯 Foque em uma tarefa por vez - você vai longe assim!',
        '⏰ Use a técnica Pomodoro: 25 min de foco + 5 min de pausa!'
      ]
    },
    zen: {
      greetings: ['🧘‍♀️ Com calma...', '🌸 Respire fundo', '☮️ Paz interior'],
      taskComplete: [
        '🌺 Bem feito. Cada passo é uma vitória silenciosa.',
        '🕯️ Parabéns. Você encontrou seu ritmo.',
        '🌿 Excelente. O progresso constante traz serenidade.'
      ],
      tips: [
        '🌱 Lembre-se: o importante não é a velocidade, mas a constância.',
        '🧘‍♂️ Pare 5 minutos para meditar entre as tarefas.',
        '🌊 Flua com suas tarefas, sem pressa, mas sem pausa.'
      ]
    },
    profissional: {
      greetings: ['📋 Vamos organizar', '⚡ Eficiência máxima', '🎯 Foco total'],
      taskComplete: [
        '✅ Tarefa concluída com eficiência.',
        '📊 Excelente execução. Produtividade em alta.',
        '🎯 Objetivo alcançado. Próximo item da agenda.'
      ],
      tips: [
        '📈 Priorize tarefas por impacto e urgência (Matriz de Eisenhower).',
        '⏱️ Time-blocking: reserve blocos específicos para cada tipo de tarefa.',
        '📝 Revise sua lista diariamente e ajuste conforme necessário.'
      ]
    },
    brincalhao: {
      greetings: ['🎪 Hora da diversão!', '🎮 Game on!', '🎨 Criatividade!'],
      taskComplete: [
        '🎊 Uhuu! Você mandou bem! 🥳',
        '🏆 Level up! Você está ficando expert nisso! 🎮',
        '🌈 Show de bola! Que tal uma dancinha comemorativa? 💃'
      ],
      tips: [
        '🎵 Que tal uma playlist motivadora para acompanhar suas tarefas?',
        '🍎 Recompense-se com algo gostoso a cada tarefa concluída!',
        '🎯 Transforme suas metas em um jogo - você é o protagonista!'
      ]
    }
  };

  async generateResponse(
    userMessage: string,
    personality: PersonalityType,
    tasks: Task[],
    stats: TaskStats,
    actions: { addTask: any; completeTask: any }
  ): Promise<string> {
    const message = userMessage.toLowerCase();
    const personalityData = this.personalities[personality];

    // Handle task creation
    if (message.includes('criar') && message.includes('tarefa')) {
      return this.handleTaskCreation(userMessage, personalityData);
    }

    // Handle statistics request
    if (message.includes('estatística') || message.includes('estatisticas') || message.includes('progresso')) {
      return this.generateStatsResponse(stats, personalityData);
    }

    // Handle productivity tips
    if (message.includes('dica') || message.includes('produtividade') || message.includes('ajuda')) {
      return this.getRandomTip(personalityData);
    }

    // Handle goal setting
    if (message.includes('meta') || message.includes('objetivo')) {
      return this.handleGoalSetting(personalityData);
    }

    // Handle celebration
    if (message.includes('concluí') || message.includes('terminei') || message.includes('finalizei')) {
      return this.getRandomCelebration(personalityData);
    }

    // General conversation
    return this.generateGeneralResponse(userMessage, personalityData, personality);
  }

  private handleTaskCreation(userMessage: string, personalityData: any): string {
    const responses = [
      `${personalityData.greetings[0]} Vou te ajudar a criar uma nova tarefa! Para criar uma tarefa completa, me diga:\n\n📝 Título da tarefa\n📂 Categoria (trabalho, pessoal, urgente, estudos)\n⭐ Prioridade (baixa, média, alta)\n\nOu vá para a seção "Tarefas" para criar diretamente!`,
      `Legal! ${personalityData.greetings[1]} Para organizar melhor, que tal me contar mais detalhes sobre essa tarefa? Assim posso te dar dicas mais específicas!`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateStatsResponse(stats: TaskStats, personalityData: any): string {
    const completionEmoji = stats.completionRate >= 80 ? '🔥' : stats.completionRate >= 60 ? '👏' : '💪';
    
    return `${completionEmoji} Aqui estão suas estatísticas:\n\n📊 **Resumo Geral**\n• Total de tarefas: ${stats.totalTasks}\n• Concluídas: ${stats.completedTasks}\n• Taxa de conclusão: ${stats.completionRate.toFixed(1)}%\n• Sequência atual: ${stats.streak} dias\n\n${this.getStatsMotivation(stats, personalityData)}`;
  }

  private getStatsMotivation(stats: TaskStats, personalityData: any): string {
    if (stats.completionRate >= 80) {
      return personalityData.taskComplete[0];
    } else if (stats.completionRate >= 50) {
      return `🎯 Você está no caminho certo! ${personalityData.greetings[1]}`;
    } else {
      return `💪 Todo começo é uma oportunidade! ${personalityData.greetings[2]}`;
    }
  }

  private getRandomTip(personalityData: any): string {
    const tips = personalityData.tips;
    return tips[Math.floor(Math.random() * tips.length)];
  }

  private handleGoalSetting(personalityData: any): string {
    return `🎯 ${personalityData.greetings[0]} Definir metas é essencial! Aqui estão algumas sugestões:\n\n📅 **Metas Diárias:**\n• Concluir 3-5 tarefas importantes\n• Manter foco por blocos de 25-50 minutos\n• Fazer pausas regulares\n\n📈 **Metas Semanais:**\n• Manter taxa de conclusão acima de 70%\n• Organizar tarefas por prioridade\n• Revisar e ajustar objetivos\n\n${this.getRandomTip(personalityData)}`;
  }

  private getRandomCelebration(personalityData: any): string {
    const celebrations = personalityData.taskComplete;
    return celebrations[Math.floor(Math.random() * celebrations.length)];
  }

  private generateGeneralResponse(userMessage: string, personalityData: any, personality: PersonalityType): string {
    const responses = {
      motivador: [
        '💪 Estou aqui para te impulsionar! Como posso ajudar você a conquistar seus objetivos hoje?',
        '🔥 Que energia boa! Vamos transformar essa motivação em ação concreta!',
        '⚡ Cada pequeno passo te aproxima do sucesso! O que vamos fazer agora?'
      ],
      zen: [
        '🧘‍♀️ Estou aqui para te acompanhar nessa jornada. Respire fundo e me conte como posso ajudar.',
        '🌸 A paciência e a constância são suas maiores aliadas. Como posso apoiar seu fluxo hoje?',
        '☮️ Encontre seu ritmo natural. Estou aqui para te guiar com serenidade.'
      ],
      profissional: [
        '📋 Vamos focar na eficiência. Em que posso ajudar para otimizar sua produtividade?',
        '⚡ Tempo é recurso valioso. Como posso contribuir para seus resultados hoje?',
        '🎯 Organização é a chave do sucesso. Qual área precisa de mais estrutura?'
      ],
      brincalhao: [
        '🎪 Oi, oi! Que bom ter você aqui! Vamos tornar sua produtividade mais divertida?',
        '🎮 Hey! Pronto para mais uma aventura produtiva? Como posso deixar seu dia mais interessante?',
        '🌈 Trabalhar pode ser divertido também! Me conta o que rola por aí!'
      ]
    };

    const personalityResponses = responses[personality];
    return personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
  }
}
