import React, { useState } from 'react';
import { Copy, Check, Clock, MessageSquare, Trash2 } from 'lucide-react';

interface HistoryItem {
  id: string;
  content: string;
  timestamp: string;
}

interface HistoryProps {
  history: HistoryItem[];
  onClearHistory: () => void;
}

export const History: React.FC<HistoryProps> = ({ history, onClearHistory }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 h-64">
        <Clock className="text-gray-300 dark:text-gray-600 mb-4" size={48} />
        <p className="text-gray-500 dark:text-gray-400 font-medium">No history yet</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Generate a message to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Clock size={20} className="text-gray-500" />
            Past Messages
        </h3>
        <button 
            onClick={onClearHistory}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
            <Trash2 size={12} /> Clear History
        </button>
      </div>

      <div className="space-y-4">
        {history.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm transition-colors">
            <div className="flex justify-between items-start mb-3">
               <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <MessageSquare size={12} />
                    <span>{item.timestamp}</span>
               </div>
               <button
                  onClick={() => handleCopy(item.id, item.content)}
                  className={`p-1.5 rounded-md transition-colors ${
                      copiedId === item.id
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  title="Copy"
               >
                  {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
               </button>
            </div>
            
            <div className="bg-[#e5ddd5]/50 dark:bg-[#0f172a]/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                 <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-sans leading-relaxed line-clamp-4 hover:line-clamp-none transition-all cursor-default">
                    {item.content}
                 </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};