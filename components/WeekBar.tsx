import React from 'react';
import { Match } from '../types';

interface WeekBarProps {
  matches: Match[];
}

export const WeekBar: React.FC<WeekBarProps> = ({ matches }) => {
  const today = new Date();
  const currentDay = today.getDay(); 
  const daysToSubtract = (currentDay + 6) % 7;
  
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - daysToSubtract);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });

  const isSameDate = (d1: Date, d2Str: string) => {
    try {
      const d2 = new Date(d2Str);
      return d1.getDate() === d2.getDate() && 
             d1.getMonth() === d2.getMonth() && 
             d1.getFullYear() === d2.getFullYear();
    } catch {
      return false;
    }
  };

  const isToday = (date: Date) => {
    const now = new Date();
    return date.getDate() === now.getDate() && 
           date.getMonth() === now.getMonth() && 
           date.getFullYear() === now.getFullYear();
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-gray-700/50 p-3 transition-all hover:shadow-2xl hover:shadow-blue-500/5">
        <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 text-center">Fixtures Calendar</h3>
        <div className="grid grid-cols-7 gap-1.5">
            {weekDays.map((date, i) => {
                const hasMatch = matches.some(m => isSameDate(date, m.date));
                const active = isToday(date);
                
                return (
                    <div 
                        key={i} 
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all relative overflow-hidden ${
                            hasMatch 
                                ? 'bg-gradient-to-br from-brand-orange to-red-500 text-white shadow-lg shadow-orange-500/30 transform scale-105 border border-orange-400/50' 
                                : active 
                                    ? 'bg-white/80 dark:bg-blue-900/40 border border-brand-blue/30 text-brand-blue dark:text-blue-300 shadow-md backdrop-blur-sm'
                                    : 'bg-white/30 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400 border border-white/20 hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm'
                        }`}
                    >
                        {/* Glass shine for active/match days */}
                        {(hasMatch || active) && (
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
                        )}

                        <span className="text-[8px] font-extrabold uppercase opacity-90 tracking-wider">
                            {date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)}
                        </span>
                        <span className={`text-sm font-black mt-0.5 ${hasMatch ? 'text-white' : ''}`}>
                            {date.getDate()}
                        </span>
                        
                        {/* Dot indicator for match */}
                        {hasMatch && (
                            <div className="w-1 h-1 bg-white rounded-full mt-1 shadow-[0_0_4px_rgba(255,255,255,0.8)]"></div>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
  );
};