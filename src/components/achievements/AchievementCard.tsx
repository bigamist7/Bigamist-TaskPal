
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Progress } from '../ui/progress';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementCardProps {
  achievement: Achievement;
}

const rarityConfig = {
  common: { color: 'border-gray-300 bg-gray-50', badge: 'bg-gray-100 text-gray-700' },
  rare: { color: 'border-blue-300 bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  epic: { color: 'border-purple-300 bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
  legendary: { color: 'border-yellow-300 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' }
};

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const Icon = achievement.icon;
  const rarityStyle = rarityConfig[achievement.rarity];
  const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

  return (
    <div
      className={`relative bg-white/90 backdrop-blur-sm rounded-xl p-6 border-2 transition-all duration-200 hover:shadow-lg hover:scale-105 ${
        achievement.unlocked 
          ? `${rarityStyle.color} shadow-md` 
          : 'border-gray-200 bg-gray-50/50 opacity-75'
      }`}
    >
      {/* Rarity Badge */}
      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${rarityStyle.badge}`}>
        {achievement.rarity === 'common' && '⚪'}
        {achievement.rarity === 'rare' && '🔵'}
        {achievement.rarity === 'epic' && '🟣'}
        {achievement.rarity === 'legendary' && '🟡'}
        {achievement.rarity.toUpperCase()}
      </div>

      {/* Icon */}
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${achievement.color} mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <h3 className={`text-lg font-bold ${achievement.unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
            {achievement.unlocked ? '🏆' : '🔒'} {achievement.title}
          </h3>
          <p className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
            {achievement.description}
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}>
              Progresso
            </span>
            <span className={`font-medium ${achievement.unlocked ? 'text-gray-700' : 'text-gray-500'}`}>
              {achievement.progress}/{achievement.maxProgress}
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className={`h-2 ${achievement.unlocked ? '' : 'opacity-50'}`}
          />
        </div>

        {/* Status */}
        <div className="pt-2">
          {achievement.unlocked ? (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Desbloqueada!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm">
                {achievement.maxProgress - achievement.progress} restante
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Glow effect for unlocked achievements */}
      {achievement.unlocked && (
        <div className={`absolute inset-0 bg-gradient-to-r ${achievement.color} opacity-10 rounded-xl`}></div>
      )}
    </div>
  );
};
