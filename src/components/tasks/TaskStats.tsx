
import React from 'react';
import { useTask } from '../../contexts/TaskContext';
import { CheckCircle, Clock, TrendingUp, Target } from 'lucide-react';

export const TaskStats: React.FC = () => {
  const { getStats } = useTask();
  const stats = getStats();

  const statCards = [
    {
      label: 'Total',
      value: stats.totalTasks,
      icon: Target,
      color: 'from-blue-500 to-purple-500',
      textColor: 'text-blue-600'
    },
    {
      label: 'Concluídas',
      value: stats.completedTasks,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-600'
    },
    {
      label: 'Taxa',
      value: `${stats.completionRate.toFixed(0)}%`,
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      textColor: 'text-orange-600'
    },
    {
      label: 'Sequência',
      value: `${stats.streak}d`,
      icon: Clock,
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/40 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};
