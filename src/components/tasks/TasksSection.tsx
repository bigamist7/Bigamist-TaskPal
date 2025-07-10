
import React, { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { useTask, Task } from '../../contexts/TaskContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { TaskCard } from './TaskCard';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskStats } from './TaskStats';

export const TasksSection: React.FC = () => {
  const { tasks, getTasksByCategory } = useTask();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | Task['category']>('all');
  const [showCompleted, setShowCompleted] = useState(true);

  const categories = [
    { id: 'all', label: 'Todas', color: 'bg-gray-100 text-gray-700' },
    { id: 'trabalho', label: 'Trabalho', color: 'bg-blue-100 text-blue-700' },
    { id: 'pessoal', label: 'Pessoal', color: 'bg-green-100 text-green-700' },
    { id: 'urgente', label: 'Urgente', color: 'bg-red-100 text-red-700' },
    { id: 'estudos', label: 'Estudos', color: 'bg-purple-100 text-purple-700' },
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesCompleted = showCompleted || !task.completed;
    
    return matchesSearch && matchesCategory && matchesCompleted;
  });

  const pendingTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-green-50/50 to-blue-50/50">
      {/* Header */}
      <div className="p-6 bg-white/70 backdrop-blur-sm border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Minhas Tarefas</h2>
            <p className="text-gray-600">Organize e acompanhe seu progresso</p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>

        <TaskStats />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 border-white/40"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id as any)}
                className={`whitespace-nowrap ${
                  selectedCategory === category.id 
                    ? category.color.replace('100', '500').replace('700', 'white')
                    : `${category.color} border-white/40 hover:bg-white/90`
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCompleted(!showCompleted)}
            className={`${
              showCompleted 
                ? 'bg-gray-100 text-gray-700' 
                : 'bg-white/70 text-gray-500'
            } border-white/40`}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showCompleted ? 'Ocultar concluídas' : 'Mostrar concluídas'}
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                📋 Pendentes ({pendingTasks.length})
              </h3>
              <div className="grid gap-3">
                {pendingTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && showCompleted && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                ✅ Concluídas ({completedTasks.length})
              </h3>
              <div className="grid gap-3">
                {completedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma tarefa encontrada</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Tente ajustar os filtros de busca' : 'Que tal criar sua primeira tarefa?'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Tarefa
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};
