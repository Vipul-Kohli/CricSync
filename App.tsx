import React, { useState, useEffect } from 'react';
import { Extractor } from './components/Extractor';
import { MatchList } from './components/MatchList';
import { Generator } from './components/Generator';
import { SocialSetup } from './components/SocialSetup';
import { WeekBar } from './components/WeekBar';
import { LogConsole } from './components/LogConsole';
import { FixtureSettings } from './components/FixtureSettings';
import { Match, ExtractionResult, Source, InputMode } from './types';
import { Trophy, Link as LinkIcon, Moon, Sun, Search, Wand2, Terminal } from 'lucide-react';
import { generateWhatsAppMessage } from './services/gemini';

type Tab = 'schedule' | 'generator' | 'social';

const App: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('schedule');
  const [generatedMessage, setGeneratedMessage] = useState('');
  
  // Extractor State
  const [extractorMode, setExtractorMode] = useState<InputMode>('search');
  
  // Match Settings State
  const [matchFees, setMatchFees] = useState('');
  const [payToNumber, setPayToNumber] = useState('');
  
  // Social State
  const [waLink, setWaLink] = useState('');
  const [waConnected, setWaConnected] = useState(false);
  
  // Persistent Logs State
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handleMatchesExtracted = async (result: ExtractionResult) => {
    const newMatches = result.matches;
    const allMatches = [...matches, ...newMatches];
    
    setMatches(prev => [...prev, ...newMatches]);
    setSources(result.sources);
    
    // Auto-generate message (Note: matchFees/payToNumber might be empty initially, which is fine)
    if (allMatches.length > 0) {
        try {
            const msg = await generateWhatsAppMessage(allMatches, 'casual', '', {
              header: 'Upcoming Match',
              fees: matchFees,
              payTo: payToNumber,
              ballColor: 'White'
            });
            setGeneratedMessage(msg);
            setActiveTab('generator');
        } catch (e) {
            console.error("Auto-generation failed", e);
            setActiveTab('generator');
        }
    }
  };

  const updateMatch = (id: string, updates: Partial<Match>) => {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMatch = (id: string) => {
    setMatches(prev => prev.filter(m => m.id !== id));
  };

  const clearAll = () => {
    setMatches([]);
    setSources([]);
    setGeneratedMessage('');
  };

  const handleAddMatch = () => {
    setExtractorMode('text');
    setActiveTab('schedule');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShareMatch = async (id: string) => {
    // 1. Select ONLY the clicked match, deselect others
    const updatedMatches = matches.map(m => ({
        ...m,
        selected: m.id === id
    }));
    setMatches(updatedMatches);

    // 2. Find the match to generate content for immediately
    const targetMatch = updatedMatches.find(m => m.id === id);
    if (targetMatch) {
        setGeneratedMessage("Generating message for " + targetMatch.opponent + "...");
        try {
            const msg = await generateWhatsAppMessage([targetMatch], 'casual', '', {
                header: 'Upcoming Match',
                fees: matchFees,
                payTo: payToNumber,
                ballColor: 'White'
            });
            setGeneratedMessage(msg);
        } catch (e) {
            console.error("Single match generation failed", e);
            setGeneratedMessage("Error generating message. Please try again in the Generator tab.");
        }
    }

    // 3. Switch to Generator tab
    setActiveTab('generator');
  };

  return (
    <div className="min-h-screen font-sans pb-24 transition-colors duration-300 relative text-gray-900 dark:text-gray-100">
      {/* Glass Header */}
      <header className="sticky top-0 z-20 transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-gray-900/60 border-b border-white/20 dark:border-white/5 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-dark dark:text-blue-400">
                <div className="bg-gradient-to-br from-brand-orange to-red-500 p-1 rounded-xl text-white shadow-lg shadow-orange-500/20">
                    <Trophy size={18} strokeWidth={2.5} />
                </div>
                <h1 className="text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-200">CricSync</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowLogModal(true)}
                className="p-1.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 transition-colors relative backdrop-blur-sm"
                title="View System Logs"
              >
                <Terminal size={18} />
                {logs.length > 0 && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>}
              </button>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 transition-colors backdrop-blur-sm"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-3 space-y-3">
        
        <div className="animate-in fade-in zoom-in-95 duration-300">
            {activeTab === 'schedule' && (
                <div className="space-y-3">
                    <FixtureSettings 
                        fees={matchFees} 
                        setFees={setMatchFees} 
                        payTo={payToNumber} 
                        setPayTo={setPayToNumber} 
                    />

                    <Extractor 
                        onMatchesExtracted={handleMatchesExtracted} 
                        logs={logs}
                        onLog={addLog}
                        onClearLogs={clearLogs}
                        mode={extractorMode}
                        onModeChange={setExtractorMode}
                    />
                    
                    {sources.length > 0 && (
                        <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-xl p-3 text-xs transition-colors shadow-sm">
                            <p className="text-gray-600 dark:text-gray-300 font-bold mb-1 flex items-center gap-1 uppercase tracking-wider">
                                <LinkIcon size={12} strokeWidth={2.5} /> Sources:
                            </p>
                            <ul className="space-y-0.5">
                                {sources.map((s, i) => (
                                    <li key={i}>
                                        <a href={s.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate block font-medium">
                                            {s.title || s.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'generator' && (
                <div className="space-y-3">
                    {matches.length > 0 && (
                        <>
                            <WeekBar matches={matches} />
                            <MatchList 
                                matches={matches} 
                                onUpdateMatch={updateMatch}
                                onDeleteMatch={deleteMatch}
                                onClearAll={clearAll}
                                onShareMatch={handleShareMatch}
                                onAddMatch={handleAddMatch}
                            />
                        </>
                    )}
                    
                    <Generator 
                        matches={matches} 
                        message={generatedMessage}
                        onMessageUpdate={setGeneratedMessage}
                        defaultFees={matchFees}
                        defaultPayTo={payToNumber}
                        waLink={waLink}
                    />
                </div>
            )}

            {activeTab === 'social' && (
                <SocialSetup 
                    waLink={waLink}
                    setWaLink={setWaLink}
                    waConnected={waConnected}
                    setWaConnected={setWaConnected}
                />
            )}
        </div>

      </main>

      {/* Log Modal with Glass Effect */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-2xl bg-gray-900/90 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 border border-white/10">
                <LogConsole 
                    logs={logs} 
                    className="h-[500px]" 
                    onClose={() => setShowLogModal(false)}
                    isOverlay={true}
                />
            </div>
        </div>
      )}

      {/* Glass Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-t border-white/20 dark:border-white/5 shadow-lg z-40 pb-safe transition-all duration-300">
          <div className="max-w-3xl mx-auto flex items-center justify-around h-14">
              <button 
                onClick={() => setActiveTab('schedule')}
                className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all ${
                    activeTab === 'schedule' 
                    ? 'text-brand-blue dark:text-blue-400 scale-105' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                  <Search size={20} strokeWidth={activeTab === 'schedule' ? 2.5 : 2} className="drop-shadow-sm" />
                  <span className="text-[9px] font-bold">Scout</span>
              </button>

              <button 
                onClick={() => setActiveTab('generator')}
                className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all ${
                    activeTab === 'generator' 
                    ? 'text-brand-blue dark:text-blue-400 scale-105' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                  <div className="relative">
                    <Wand2 size={20} strokeWidth={activeTab === 'generator' ? 2.5 : 2} className="drop-shadow-sm" />
                    {matches.filter(m => m.selected).length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-brand-orange to-red-500 text-white text-[8px] w-3 h-3 flex items-center justify-center rounded-full shadow-sm font-bold">
                            {matches.filter(m => m.selected).length}
                        </span>
                    )}
                  </div>
                  <span className="text-[9px] font-bold">Studio</span>
              </button>

              <button 
                onClick={() => setActiveTab('social')}
                className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all ${
                    activeTab === 'social' 
                    ? 'text-brand-blue dark:text-blue-400 scale-105' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                  <LinkIcon size={20} strokeWidth={activeTab === 'social' ? 2.5 : 2} className="drop-shadow-sm" />
                  <span className="text-[9px] font-bold">Connect</span>
              </button>
          </div>
      </div>
    </div>
  );
};

export default App;