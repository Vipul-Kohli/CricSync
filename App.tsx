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
    
    // Auto-generate message
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
    const updatedMatches = matches.map(m => ({
        ...m,
        selected: m.id === id
    }));
    setMatches(updatedMatches);

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
    setActiveTab('generator');
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-gray-900 pb-28 text-gray-900 dark:text-gray-100">
      {/* Clean Modern Header */}
      <header className="sticky top-0 z-20 bg-brand-bg/90 dark:bg-gray-900/90 backdrop-blur-md pt-safe">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-brand-blue text-white p-2 rounded-xl shadow-glow">
                    <Trophy size={20} strokeWidth={2.5} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">CricSync</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowLogModal(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 text-gray-500 shadow-sm border border-gray-100 dark:border-gray-700 hover:text-brand-blue relative"
              >
                <Terminal size={18} />
                {logs.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border border-white"></span>}
              </button>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 text-gray-500 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 space-y-6 pt-2">
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'schedule' && (
                <div className="space-y-6">
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
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-soft">
                            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                <LinkIcon size={12} strokeWidth={2.5} /> Data Sources
                            </p>
                            <ul className="space-y-2">
                                {sources.map((s, i) => (
                                    <li key={i}>
                                        <a href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-blue hover:underline font-semibold bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                                            <GlobeIcon />
                                            <span className="truncate">{s.title || 'Web Source'}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'generator' && (
                <div className="space-y-6">
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

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg bg-gray-900 rounded-[2rem] overflow-hidden shadow-2xl">
                <LogConsole 
                    logs={logs} 
                    className="h-[500px]" 
                    onClose={() => setShowLogModal(false)}
                    isOverlay={true}
                />
            </div>
        </div>
      )}

      {/* Modern Floating Bottom Nav */}
      <div className="fixed bottom-6 left-0 right-0 z-40 px-6 pointer-events-none">
          <div className="max-w-[280px] mx-auto bg-white dark:bg-gray-800 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-1.5 flex items-center justify-between pointer-events-auto border border-gray-100 dark:border-gray-700">
              <NavButton 
                active={activeTab === 'schedule'} 
                onClick={() => setActiveTab('schedule')} 
                icon={Search} 
                label="Scout" 
              />
              <NavButton 
                active={activeTab === 'generator'} 
                onClick={() => setActiveTab('generator')} 
                icon={Wand2} 
                label="Studio" 
                badge={matches.filter(m => m.selected).length}
              />
              <NavButton 
                active={activeTab === 'social'} 
                onClick={() => setActiveTab('social')} 
                icon={LinkIcon} 
                label="Connect" 
              />
          </div>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon: Icon, label, badge }: any) => (
    <button 
        onClick={onClick}
        className={`relative flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 ${
            active 
            ? 'bg-brand-blue text-white shadow-md' 
            : 'text-gray-400 hover:text-gray-600 dark:text-gray-500'
        }`}
    >
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        {active && <span className="text-xs font-bold animate-in fade-in slide-in-from-left-2 duration-200">{label}</span>}
        {badge > 0 && !active && (
            <span className="absolute top-2 right-3 w-2 h-2 bg-brand-orange rounded-full ring-2 ring-white"></span>
        )}
    </button>
);

const GlobeIcon = () => (
    <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center shrink-0">
        <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
    </div>
)

export default App;