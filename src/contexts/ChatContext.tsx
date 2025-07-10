
import React, { createContext, useContext, useState } from 'react';

export type PersonalityType = 'motivador' | 'zen' | 'profissional' | 'brincalhao';

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: ChatMessage[];
  personality: PersonalityType;
  setPersonality: (personality: PersonalityType) => void;
  addMessage: (content: string, type: 'user' | 'bot') => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Olá! Sou o seu assistente pessoal de produtividade! 🎯 Estou aqui para te ajudar a organizar suas tarefas e alcançar seus objetivos. Como posso ajudar hoje?',
      timestamp: new Date()
    }
  ]);
  const [personality, setPersonality] = useState<PersonalityType>('motivador');

  const addMessage = (content: string, type: 'user' | 'bot') => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      personality,
      setPersonality,
      addMessage,
      clearMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
