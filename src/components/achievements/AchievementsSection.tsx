
import React from 'react';
import { Trophy, Star, Target, Zap, Calendar, TrendingUp } from 'lucide-react';
import { useTask } from '../../contexts/TaskContext';
import { AchievementCard } from './AchievementCard';
import { ProgressChart } from './ProgressChart';

export const AchievementsSection: React.FC = () => {
  const { tasks, getStats } = useTask();
  const stats = getStats();

  // Calculate achievements
  const achievements = [
    {
      id: 'first-task',
      title: 'Primeiro Passo',
      description: 'Criou sua primeira tarefa',
      icon: Star,
      unlocked: tasks.length > 0,
      progress: Math.min(tasks.length, 1),
      maxProgress: 1,
      color: 'from-blue-500 to-purple-500',
      rarity: 'common' as const
    },
    {
      id: 'task-master',
      title: 'Mestre das Tarefas',
      description: 'Completou 10 tarefas',
      icon: Trophy,
      unlocked: stats.completedTasks >= 10,
      progress: Math.min(stats.completedTasks, 10),
      maxProgress: 10,
      color: 'from-yellow-500 to-orange-500',
      rarity: 'rare' as const
    },
    {
      id: 'productivity-champion',
      title: 'Campeão da Produtividade',
      description: 'Manteve 80% de taxa de conclusão',
      icon: Target,
      unlocked: stats.completionRate >= 80,
      progress: Math.min(stats.completionRate, 80),
      maxProgress: 80,
      color: 'from-green-500 to-emerald-500',
      rarity: 'epic' as const
    },
    {
      id: 'streak-keeper',
      title: 'Sequência Perfeita',
      description: 'Manteve uma sequência de 7 dias',
      icon: Zap,
      unlocked: stats.streak >= 7,
      progress: Math.min(stats.streak, 7),
      maxProgress: 7,
      color: 'from-purple-500 to-pink-500',
      rarity: 'legendary' as const
    },
    {
      id: 'consistent-performer',
      title: 'Performance Consistente',
      description: 'Completou tarefas por 30 dias',
      icon: Calendar,
      unlocked: stats.streak >= 30,
      progress: Math.min(stats.streak, 30),
      maxProgress: 30,
      color: 'from-indigo-500 to-blue-500',
      rarity: 'legendary' as const
    },
    {
      id: 'task-collector',
      title: 'Colecionador de Tarefas',
      description: 'Criou 50 tarefas',
      icon: TrendingUp,
      unlocked: tasks.length >= 50,
      progress: Math.min(tasks.length, 50),
      maxProgress: 50,
      color: 'from-red-500 to-pink-500',
      rarity: 'epic' as const
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-yellow-50/50 to-orange-50/50">
      {/* Header */}
      <div className="p-6 bg-white/70 backdrop-blur-sm border-b border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Conquistas</h2>
            <p className="text-gray-600">Acompanhe seu progresso e celebre suas vitórias</p>
          </div>
        </div>

        {/* Achievement Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/40">
            <div className="text-2xl font-bold text-yellow-600">{unlockedAchievements.length}</div>
            <div className="text-sm text-gray-600">Desbloqueadas</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/40">
            <div className="text-2xl font-bold text-gray-600">{achievements.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/40">
            <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
            <div className="text-sm text-gray-600">Tarefas Feitas</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/40">
            <div className="text-2xl font-bold text-purple-600">{stats.streak}d</div>
            <div className="text-sm text-gray-600">Sequência</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Progress Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/40">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              📈 Progresso dos Últimos Dias
            </h3>
            <ProgressChart />
          </div>

          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                🏆 Conquistas Desbloqueadas ({unlockedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                🔒 Próximas Conquistas ({lockedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {achievements.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-24 h-24 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma conquista ainda</h3>
              <p className="text-gray-500">Complete algumas tarefas para desbloquear conquistas!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
