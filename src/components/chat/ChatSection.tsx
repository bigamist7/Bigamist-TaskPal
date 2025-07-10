
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Lightbulb, Sparkles } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useTask } from '../../contexts/TaskContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AIService } from '../../utils/AIService';

export const ChatSection: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { messages, addMessage, personality } = useChat();
  const { tasks, getStats } = useTask();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiService = AIService.getInstance();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message
    addMessage(userMessage, 'user');
    
    try {
      // Generate AI response
      const botResponse = await aiService.generateResponse(
        userMessage, 
        personality, 
        tasks, 
        getStats()
      );
      
      // Add bot response after a small delay
      setTimeout(() => {
        addMessage(botResponse, 'bot');
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      setTimeout(() => {
        addMessage('Desculpe, ocorreu um erro. Tente novamente!', 'bot');
        setIsLoading(false);
      }, 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    '💡 Dica de produtividade',
    '📊 Analisar meu progresso',
    '🎯 Definir metas hoje',
    '⏰ Técnica Pomodoro',
    '📋 Organizar tarefas'
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50/50 to-purple-50/50">
      {/* Header with AI indicator */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="font-semibold text-gray-800">Assistente IA</h2>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            Powered by OpenAI
          </span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'bot' && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            
            <div
              className={`max-w-[70%] p-4 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-white shadow-sm border border-gray-100'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              <p className={`text-xs mt-2 ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-400'
              }`}>
                {message.timestamp.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>

            {message.type === 'user' && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white shadow-sm border border-gray-100 p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-500">Pensando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="whitespace-nowrap bg-white/70 border-white/40 hover:bg-white/90 text-gray-700"
              onClick={() => setInputMessage(action)}
              disabled={isLoading}
            >
              {action}
            </Button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/70 backdrop-blur-sm border-t border-white/20">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="pr-12 bg-white/80 border-white/40 focus:border-purple-300"
              disabled={isLoading}
            />
            <Lightbulb className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
