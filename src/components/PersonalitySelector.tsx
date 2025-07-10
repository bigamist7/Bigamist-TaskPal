
import React from 'react';
import { useChat, PersonalityType } from '../contexts/ChatContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Brain, Zap, Briefcase, Smile } from 'lucide-react';

const personalities = [
  { 
    id: 'motivador' as PersonalityType, 
    name: 'Motivador', 
    icon: Zap, 
    description: 'Energético e encorajador',
    color: 'text-orange-500'
  },
  { 
    id: 'zen' as PersonalityType, 
    name: 'Zen', 
    icon: Brain, 
    description: 'Calmo e equilibrado',
    color: 'text-green-500'
  },
  { 
    id: 'profissional' as PersonalityType, 
    name: 'Profissional', 
    icon: Briefcase, 
    description: 'Direto e eficiente',
    color: 'text-blue-500'
  },
  { 
    id: 'brincalhao' as PersonalityType, 
    name: 'Brincalhão', 
    icon: Smile, 
    description: 'Divertido e descontraído',
    color: 'text-pink-500'
  },
];

export const PersonalitySelector: React.FC = () => {
  const { personality, setPersonality } = useChat();

  const currentPersonality = personalities.find(p => p.id === personality);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">Personalidade:</span>
      <Select value={personality} onValueChange={(value: PersonalityType) => setPersonality(value)}>
        <SelectTrigger className="w-[180px] bg-white/70 border-white/40">
          <SelectValue>
            <div className="flex items-center gap-2">
              {currentPersonality && (
                <>
                  <currentPersonality.icon className={`w-4 h-4 ${currentPersonality.color}`} />
                  <span>{currentPersonality.name}</span>
                </>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {personalities.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              <div className="flex items-center gap-2">
                <p.icon className={`w-4 h-4 ${p.color}`} />
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
