
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { ChatSection } from '../components/chat/ChatSection';
import { TasksSection } from '../components/tasks/TasksSection';
import { AchievementsSection } from '../components/achievements/AchievementsSection';
import { PersonalitySelector } from '../components/PersonalitySelector';
import { TaskProvider } from '../contexts/TaskContext';
import { ChatProvider } from '../contexts/ChatContext';

export type Section = 'chat' | 'tasks' | 'achievements';

const Index = () => {
  const [activeSection, setActiveSection] = useState<Section>('chat');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'chat':
        return <ChatSection />;
      case 'tasks':
        return <TasksSection />;
      case 'achievements':
        return <AchievementsSection />;
      default:
        return <ChatSection />;
    }
  };

  return (
    <TaskProvider>
      <ChatProvider>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
          <div className="flex h-screen">
            <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            
            <main className="flex-1 flex flex-col overflow-hidden">
              <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Gestor de Tarefas
                    </h1>
                    <p className="text-gray-600 text-sm">Com chatbot personalizado</p>
                  </div>
                  <PersonalitySelector />
                </div>
              </header>
              
              <div className="flex-1 overflow-hidden">
                {renderActiveSection()}
              </div>
            </main>
          </div>
        </div>
      </ChatProvider>
    </TaskProvider>
  );
};

export default Index;
