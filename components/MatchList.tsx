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
      
      if (isNaN(date.getTime())) {
        console.warn(`[MatchList] Invalid date format received: "${dateStr}"`);
        return dateStr;
      }

      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: '2-digit' 
      }).replace(/ /g, '-');
    } catch (e) {
      console.error(`[MatchList] Error formatting date: ${dateStr}`, e);
      return dateStr;
    }
  };

  const getMatchTimestamp = (m: Match) => {
    try {
      const str = `${m.date} ${m.time}`;
      const ts = Date.parse(str);
      return isNaN(ts) ? (sortOrder === 'asc' ? Infinity : -Infinity) : ts;
    } catch {
      return 0;
    }
  };

  const sortedMatches = [...matches].sort((a, b) => {
    const tA = getMatchTimestamp(a);
    const tB = getMatchTimestamp(b);
    return sortOrder === 'asc' ? tA - tB : tB - tA;
  });

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 flex items-center gap-2">
          <span className="bg-brand-orange text-white text-xs font-bold px-2 py-0.5 rounded-lg shadow-md shadow-orange-500/20">{matches.length}</span>
          Upcoming Matches
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={onAddMatch}
            className="flex items-center gap-1 text-[10px] text-brand-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold px-2.5 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all backdrop-blur-sm border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
          >
            <Plus size={14} strokeWidth={3} />
            Add Match
          </button>
          <div className="h-3 w-px bg-gray-300 dark:bg-gray-700"></div>
          <button 
            onClick={toggleSort}
            className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-brand-blue dark:text-gray-400 dark:hover:text-blue-400 font-bold px-2.5 py-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-all backdrop-blur-sm"
          >
            <ArrowUpDown size={12} strokeWidth={2.5} />
            {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
          </button>
          <div className="h-3 w-px bg-gray-300 dark:bg-gray-700"></div>
          <button 
              onClick={onClearAll}
              className="text-[10px] text-red-500 hover:text-red-700 dark:hover:text-red-400 font-bold px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
              Clear All
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {sortedMatches.map((match) => (
          <div 
            key={match.id}
            className={`group relative rounded-2xl p-3 transition-all duration-300 cursor-pointer backdrop-blur-xl border ${
              match.selected 
                ? 'bg-white/90 dark:bg-gray-800/90 border-brand-blue shadow-xl shadow-blue-500/10 scale-[1.01]' 
                : 'bg-white/50 dark:bg-gray-800/40 border-white/40 dark:border-white/10 hover:bg-white/70 dark:hover:bg-gray-800/60 hover:shadow-lg'
            }`}
            onClick={() => onUpdateMatch(match.id, { selected: !match.selected })}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-1 transition-all duration-300 ${match.selected ? 'text-brand-blue scale-110' : 'text-gray-400 dark:text-gray-600'}`}>
                {match.selected ? <CheckCircle2 size={22} className="fill-brand-light dark:fill-blue-900/30" strokeWidth={2.5} /> : <Circle size={22} strokeWidth={2} />}
              </div>
              
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-black text-lg truncate">
                        <div className="p-1.5 bg-brand-orange/10 rounded-lg text-brand-orange shrink-0">
                            <Shield size={16} strokeWidth={2.5} />
                        </div>
                        <div className="truncate flex items-center gap-2">
                            <span className="text-gray-800 dark:text-gray-100">{match.homeTeam || 'My Team'}</span>
                            <span className="text-[10px] font-black text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded-md">VS</span>
                            <span>{match.opponent}</span>
                        </div>
                        {match.matchUrl && (
                             <a 
                                href={match.matchUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-brand-blue transition-colors shrink-0 ml-1"
                                title="View Match Page"
                                onClick={(e) => e.stopPropagation()}
                             >
                                <ExternalLink size={14} strokeWidth={2.5} />
                             </a>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-black/20 p-2 rounded-lg border border-white/30 dark:border-white/5">
                        <Calendar size={14} className="text-brand-blue dark:text-blue-400 shrink-0" strokeWidth={2.5} />
                        <span className="font-bold">{formatDate(match.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-black/20 p-2 rounded-lg border border-white/30 dark:border-white/5">
                        <Clock size={14} className="text-brand-blue dark:text-blue-400 shrink-0" strokeWidth={2.5} />
                        <span className="font-bold">{match.time}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2 group/venue text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-black/20 p-2 rounded-lg border border-white/30 dark:border-white/5">
                        <MapPin size={14} className="text-brand-blue dark:text-blue-400 shrink-0" strokeWidth={2.5} />
                        
                        {match.mapLink ? (
                             <a 
                                href={match.mapLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="truncate hover:text-brand-blue dark:hover:text-blue-400 hover:underline decoration-dotted underline-offset-2 transition-all flex items-center gap-1 w-full font-bold"
                                title="View on Google Maps"
                                onClick={(e) => e.stopPropagation()}
                             >
                                <span className="truncate">{match.venue}</span>
                                <ExternalLink size={10} className="opacity-0 group-hover/venue:opacity-50 transition-opacity shrink-0 ml-auto" strokeWidth={2.5} />
                             </a>
                        ) : (
                            <span className="truncate font-bold">{match.venue}</span>
                        )}
                    </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <button 
                    className="p-2 text-brand-blue bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm backdrop-blur-sm scale-90 hover:scale-100 border border-blue-200 dark:border-blue-800"
                    title="Generate & Share"
                    onClick={(e) => {
                        e.stopPropagation();
                        onShareMatch(match.id);
                    }}
                >
                    <Share2 size={14} strokeWidth={2.5} />
                </button>
                <button 
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50/80 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm scale-90 hover:scale-100 border border-transparent hover:border-red-200"
                    title="Remove Match"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMatch(match.id);
                    }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};