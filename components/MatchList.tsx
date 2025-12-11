import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Shield, CheckCircle2, Circle, ExternalLink, ArrowUpDown, Share2, Plus } from 'lucide-react';
import { Match } from '../types';

interface MatchListProps {
  matches: Match[];
  onUpdateMatch: (id: string, updates: Partial<Match>) => void;
  onDeleteMatch: (id: string) => void;
  onClearAll: () => void;
  onShareMatch: (id: string) => void;
  onAddMatch: () => void;
}

export const MatchList: React.FC<MatchListProps> = ({ matches, onUpdateMatch, onDeleteMatch, onClearAll, onShareMatch, onAddMatch }) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  if (matches.length === 0) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
    } catch { return dateStr; }
  };

  const sortedMatches = [...matches].sort((a, b) => {
    const tA = new Date(a.date).getTime();
    const tB = new Date(b.date).getTime();
    return sortOrder === 'asc' ? tA - tB : tB - tA;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/20 text-brand-orange flex items-center justify-center text-xs font-bold shadow-sm">{matches.length}</span>
          Matches
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={onAddMatch} className="w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm text-brand-blue">
            <Plus size={16} strokeWidth={2.5} />
          </button>
          <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm text-gray-500">
            <ArrowUpDown size={14} />
          </button>
          <button onClick={onClearAll} className="text-[10px] font-bold text-red-500 px-2.5 py-1 bg-red-50 rounded-full">
            Clear
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {sortedMatches.map((match) => (
          <div 
            key={match.id}
            onClick={() => onUpdateMatch(match.id, { selected: !match.selected })}
            className={`relative bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-soft border-2 transition-all cursor-pointer group ${
                match.selected ? 'border-brand-blue' : 'border-transparent hover:border-gray-100 dark:hover:border-gray-700'
            }`}
          >
            {/* Selection Checkbox */}
            <div className={`absolute top-4 right-4 transition-colors ${match.selected ? 'text-brand-blue' : 'text-gray-300'}`}>
                {match.selected ? <CheckCircle2 size={20} className="fill-blue-50" strokeWidth={2.5} /> : <Circle size={20} />}
            </div>

            {/* Teams */}
            <div className="pr-8 mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-brand-blue">
                        <Shield size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">My Team VS</p>
                        <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">{match.opponent}</h4>
                    </div>
                </div>
            </div>

            {/* Match Info Grid */}
            <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-brand-input dark:bg-gray-900/50 p-2.5 rounded-xl flex items-center gap-2">
                    <Calendar size={16} className="text-brand-blue shrink-0" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{formatDate(match.date)}</span>
                </div>
                <div className="bg-brand-input dark:bg-gray-900/50 p-2.5 rounded-xl flex items-center gap-2">
                    <Clock size={16} className="text-brand-orange shrink-0" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{match.time}</span>
                </div>
            </div>
            
            {/* Venue */}
            <div className="bg-brand-input dark:bg-gray-900/50 p-2.5 rounded-xl flex items-start gap-2">
                <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                {match.mapLink ? (
                    <a href={match.mapLink} target="_blank" className="text-xs font-bold text-gray-700 hover:text-brand-blue truncate underline decoration-dotted underline-offset-4" onClick={e => e.stopPropagation()}>
                        {match.venue}
                    </a>
                ) : (
                    <span className="text-xs font-bold text-gray-700 truncate">{match.venue}</span>
                )}
            </div>

            {/* Quick Actions */}
            <div className="mt-3 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={(e) => { e.stopPropagation(); onShareMatch(match.id); }} className="p-2 rounded-full bg-blue-50 text-brand-blue hover:bg-brand-blue hover:text-white transition-colors">
                    <Share2 size={14} />
                 </button>
                 {match.matchUrl && (
                    <a href={match.matchUrl} target="_blank" onClick={e => e.stopPropagation()} className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                        <ExternalLink size={14} />
                    </a>
                 )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};