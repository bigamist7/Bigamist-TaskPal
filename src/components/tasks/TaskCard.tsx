
import React, { useState } from 'react';
import { Check, Clock, AlertCircle, Trash2, Edit, Calendar } from 'lucide-react';
import { Task, useTask } from '../../contexts/TaskContext';
import { Button } from '../ui/button';
import { useChat } from '../../contexts/ChatContext';

interface TaskCardProps {
  task: Task;
}

const categoryConfig = {
  trabalho: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '💼' },
  pessoal: { color: 'bg-green-100 text-green-700 border-green-200', icon: '👤' },
  urgente: { color: 'bg-red-100 text-red-700 border-red-200', icon: '🚨' },
  estudos: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '📚' },
};

const priorityConfig = {
  baixa: { color: 'text-gray-500', icon: '⚪' },
  média: { color: 'text-yellow-500', icon: '🟡' },
  alta: { color: 'text-red-500', icon: '🔴' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { completeTask, deleteTask } = useTask();
  const { addMessage } = useChat();
  const [isExpanded, setIsExpanded] = useState(false);

  const categoryStyle = categoryConfig[task.category];
  const priorityStyle = priorityConfig[task.priority];

  const handleComplete = () => {
    completeTask(task.id);
    
    // Add celebration message to chat
    const celebrations = [
      `🎉 Parabéns! Você concluiu "${task.title}"! Continue assim!`,
      `✨ Mais uma tarefa finalizada! "${task.title}" ✓ Você está arrasando!`,
      `🏆 Excelente trabalho! "${task.title}" foi concluída com sucesso!`
    ];
    
    const celebration = celebrations[Math.floor(Math.random() * celebrations.length)];
    setTimeout(() => {
      addMessage(celebration, 'bot');
    }, 500);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div
      className={`bg-white/90 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
        task.completed ? 'opacity-75' : ''
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Complete Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleComplete}
            disabled={task.completed}
            className={`rounded-full p-2 ${
              task.completed
                ? 'bg-green-100 text-green-600 border-green-200'
                : 'hover:bg-green-50 hover:text-green-600 hover:border-green-200'
            }`}
          >
            <Check className="w-4 h-4" />
          </Button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3
                className={`text-lg font-medium ${
                  task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                }`}
              >
                {task.title}
              </h3>
              
              <div className="flex items-center gap-2 ml-4">
                <span className={`text-sm ${priorityStyle.color}`}>
                  {priorityStyle.icon}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTask(task.id)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p
                className={`text-sm mb-3 ${
                  task.completed ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Tags and Info */}
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${categoryStyle.color}`}
              >
                <span>{categoryStyle.icon}</span>
                {task.category}
              </span>

              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {formatDate(task.createdAt)}
              </span>

              {task.completed && task.completedAt && (
                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                  <Check className="w-3 h-3" />
                  Concluída em {formatDate(task.completedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {task.completed && (
        <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-b-xl"></div>
      )}
    </div>
  );
};
