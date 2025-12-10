import React from 'react';
import { Calendar } from 'lucide-react';

interface TargetWeekendProps {
  dates: { saturday: string; sunday: string };
}

export const TargetWeekend: React.FC<TargetWeekendProps> = ({ dates }) => {
  // Helper to parse "Sat, Dec 6, 2025" -> { day: "06", month: "DEC" }
  const format = (dateStr: string) => {
    try {
      // Expected format from service: "Sat, Dec 6, 2025"
      const parts = dateStr.split(', '); 
      if (parts.length < 2) return { day: '?', month: '?' };
      
      const [month, day] = parts[1].split(' ');
      return { day: day.padStart(2, '0'), month: month.toUpperCase() };
    } catch (e) {
      return { day: '?', month: '?' };
    }
  };

  const sat = format(dates.saturday);
  const sun = format(dates.sunday);

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4 mb-4 shadow-sm relative overflow-hidden group">
        {/* Left Accent Line */}
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue"></div>
        
        <div className="flex items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-full bg-brand-light dark:bg-blue-900/20 flex items-center justify-center text-brand-blue dark:text-blue-400 shadow-sm border border-brand-light dark:border-blue-900/30">
                <Calendar size={18} />
            </div>
            <div>
                <h3 className="text-xs font-bold text-brand-dark dark:text-blue-300 uppercase tracking-wider">Search Target</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Scouting for next weekend</p>
            </div>
        </div>

        <div className="flex items-center gap-4 z-10">
            <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">SAT</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white leading-none tracking-tight">{sat.day}</span>
                </div>
                <span className="text-[10px] font-bold text-brand-orange">{sat.month}</span>
            </div>
            
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

            <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">SUN</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white leading-none tracking-tight">{sun.day}</span>
                </div>
                <span className="text-[10px] font-bold text-brand-orange">{sun.month}</span>
            </div>
        </div>
    </div>
  );
};