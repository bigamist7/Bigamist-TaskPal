
import React from 'react';
import { MessageCircle, CheckSquare, Trophy, Sparkles } from 'lucide-react';
import { Section } from '../pages/Index';

interface SidebarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
}

const menuItems = [
  { id: 'chat' as Section, label: 'Chat', icon: MessageCircle, color: 'from-blue-500 to-purple-500' },
  { id: 'tasks' as Section, label: 'Tarefas', icon: CheckSquare, color: 'from-green-500 to-emerald-500' },
  { id: 'achievements' as Section, label: 'Conquistas', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  return (
    <aside className="w-64 bg-white/90 backdrop-blur-sm border-r border-white/20 p-4">
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              TaskBot
            </span>
          </div>
          <p className="text-sm text-gray-600">Seu assistente pessoal</p>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                        : 'text-gray-600 hover:bg-gray-100/70 hover:scale-102'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
          <p className="text-sm text-purple-700 font-medium">💡 Dica do dia</p>
          <p className="text-xs text-purple-600 mt-1">
            Use a técnica Pomodoro: 25 min de foco + 5 min de pausa!
          </p>
        </div>
      </div>
    </aside>
  );
};
