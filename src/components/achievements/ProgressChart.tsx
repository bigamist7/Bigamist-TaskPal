
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTask } from '../../contexts/TaskContext';

export const ProgressChart: React.FC = () => {
  const { tasks } = useTask();

  // Generate data for the last 7 days
  const generateChartData = () => {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === date.toDateString();
      });

      const completedTasks = tasks.filter(task => {
        if (!task.completedAt) return false;
        const completedDate = new Date(task.completedAt);
        return completedDate.toDateString() === date.toDateString();
      });

      data.push({
        day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        created: dayTasks.length,
        completed: completedTasks.length,
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      });
    }

    return data;
  };

  const chartData = generateChartData();

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
          <XAxis 
            dataKey="day" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
            labelStyle={{ color: '#374151' }}
          />
          <Line
            type="monotone"
            dataKey="created"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 6, fill: '#3b82f6' }}
            name="Criadas"
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 6, fill: '#10b981' }}
            name="Concluídas"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
