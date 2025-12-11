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
      return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth();
    } catch { return false; }
  };

  const isToday = (date: Date) => date.getDate() === new Date().getDate() && date.getMonth() === new Date().getMonth();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-4 shadow-soft">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Fixtures Calendar</h3>
        <div className="grid grid-cols-7 gap-2">
            {weekDays.map((date, i) => {
                const hasMatch = matches.some(m => isSameDate(date, m.date));
                const active = isToday(date);
                
                return (
                    <div key={i} className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}</span>
                        <div 
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                hasMatch 
                                ? 'bg-brand-orange text-white shadow-lg shadow-orange-500/30' 
                                : active 
                                    ? 'bg-brand-blue text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-brand-input dark:bg-gray-700 text-gray-500'
                            }`}
                        >
                            {date.getDate()}
                        </div>
                        {hasMatch && <div className="w-1 h-1 bg-brand-orange rounded-full mt-1"></div>}
                    </div>
                );
            })}
        </div>
    </div>
  );
};