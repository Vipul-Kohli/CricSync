import React, { useEffect, useRef } from 'react';
import { Terminal, Loader2, X } from 'lucide-react';

interface LogConsoleProps {
  logs: string[];
  isLoading?: boolean;
  onClose?: () => void;
  className?: string;
  isOverlay?: boolean;
}

export const LogConsole: React.FC<LogConsoleProps> = ({ 
  logs, 
  isLoading = false, 
  onClose, 
  className = "",
  isOverlay = false
}) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isLoading]);

  if (logs.length === 0 && !isLoading) return null;

  return (
    <div className={`bg-gray-900 font-mono text-xs text-green-400 overflow-hidden shadow-inner border border-gray-700 flex flex-col ${className}`}>
        <div className="flex items-center justify-between border-b border-gray-700 p-2 bg-gray-900/50 backdrop-blur">
            <div className="flex items-center gap-2 text-gray-400">
                <Terminal size={12} />
                <span className="uppercase tracking-wider font-semibold">System Log</span>
            </div>
            <div className="flex items-center gap-3">
                {isLoading && <Loader2 size={12} className="animate-spin text-green-500" />}
                {onClose && (
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5 min-h-0">
            {logs.map((log, i) => {
                const isStep = log.startsWith('[Step') || log.startsWith('[Flow');
                const isError = log.includes('Error') || log.includes('Failed');
                
                return (
                    <div key={i} className="flex gap-2 animate-in fade-in duration-200">
                        <span className="text-gray-600 shrink-0 select-none">{`>`}</span>
                        <span className={`break-all ${isStep ? 'text-yellow-300 font-semibold' : ''} ${isError ? 'text-red-400' : ''}`}>
                            {log}
                        </span>
                    </div>
                );
            })}
            <div ref={logsEndRef} />
            {isLoading && (
                <div className="flex gap-2 animate-pulse">
                    <span className="text-gray-600 shrink-0 select-none">{`>`}</span>
                    <span className="w-2 h-4 bg-green-500 block"></span>
                </div>
            )}
        </div>
    </div>
  );
};