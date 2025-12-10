import React, { useState, useRef, useEffect } from 'react';
import { Camera, Type as TypeIcon, Upload, Loader2, ClipboardPaste, Search, Globe, Link, Calendar, Clock, MapPin, Shield, Plus, X } from 'lucide-react';
import { ExtractionResult, TeamSearchQuery, InputMode } from '../types';
import { extractMatches } from '../services/gemini';
import { LogConsole } from './LogConsole';

interface ExtractorProps {
  onMatchesExtracted: (result: ExtractionResult) => void;
  logs: string[];
  onLog: (msg: string) => void;
  onClearLogs: () => void;
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
}

export const Extractor: React.FC<ExtractorProps> = ({ 
  onMatchesExtracted, 
  logs, 
  onLog, 
  onClearLogs,
  mode,
  onModeChange
}) => {
  // Manual Entry State
  const [manualEntry, setManualEntry] = useState({
    opponent: '',
    date: '',
    time: '',
    venue: ''
  });

  const [searchQuery, setSearchQuery] = useState<TeamSearchQuery>({
    searchType: 'link',
    teamName: '',
    location: '',
    captainName: '',
    teamLink: ''
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const processFile = (file: File) => {
    setIsLoading(true);
    setError(null);
    onClearLogs();

    // Set preview
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        try {
          onLog("Processing image file...");
          const result = await extractMatches(base64Data, 'image', onLog);
          onMatchesExtracted(result);
        } catch (err: any) {
          setError(err.message || "Failed to extract details from image.");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Error reading file.");
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (mode !== 'image') return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            e.preventDefault();
            processFile(blob);
            break; 
          }
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [mode]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEntry.opponent || !manualEntry.date || !manualEntry.time || !manualEntry.venue) {
        setError("Please fill in all match fields.");
        return;
    }

    setIsLoading(true);
    setError(null);
    onClearLogs();

    const promptText = `Upcoming Match:\nOpponent: ${manualEntry.opponent}\nDate: ${manualEntry.date}\nTime: ${manualEntry.time}\nVenue: ${manualEntry.venue}`;

    try {
      const result = await extractMatches(promptText, 'text', onLog);
      onMatchesExtracted(result);
      setManualEntry({ opponent: '', date: '', time: '', venue: '' });
    } catch (err: any) {
      setError(err.message || "Failed to add match details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.searchType === 'details' && !searchQuery.teamName.trim()) {
        setError("Team Name is required.");
        return;
    }
    if (searchQuery.searchType === 'link' && !searchQuery.teamLink.trim()) {
        setError("Team Link is required.");
        return;
    }

    setIsLoading(true);
    setError(null);
    onClearLogs();
    
    try {
        const result = await extractMatches(searchQuery, 'search', onLog);
        if (result.matches.length === 0) {
            setError("No upcoming matches found within this week's window. Please check the link or try searching manually.");
        } else {
            onMatchesExtracted(result);
        }
    } catch (err: any) {
        setError(err.message || "Search failed. Please try again later.");
    } finally {
        setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'search', icon: Search, label: 'Search Team' },
    { id: 'image', icon: Camera, label: 'Screenshot' },
    { id: 'text', icon: TypeIcon, label: 'Manual' }
  ] as const;

  return (
    <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-gray-700/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5">
      <div className="flex border-b border-white/20 dark:border-gray-700/50 bg-white/30 dark:bg-gray-900/30">
        {tabs.map((tab) => (
             <button
                key={tab.id}
                onClick={() => onModeChange(tab.id as InputMode)}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all relative ${
                  mode === tab.id 
                    ? 'text-brand-blue dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-white/5'
                }`}
              >
                {mode === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-brand-blue shadow-[0_-2px_6px_rgba(37,99,235,0.4)]"></div>
                )}
                <tab.icon size={14} className={mode === tab.id ? 'drop-shadow-sm' : ''} strokeWidth={2.5} />
                {tab.label}
              </button>
        ))}
      </div>

      <div className="p-4">
        {mode === 'search' && (
             <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
                 <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 p-3 rounded-xl flex items-start gap-3 border border-blue-100/50 dark:border-blue-800/30 backdrop-blur-sm">
                     <div className="bg-white/80 dark:bg-blue-900/50 p-1.5 rounded-lg text-brand-blue dark:text-blue-300 shadow-sm">
                        <Globe size={18} />
                     </div>
                     <div className="text-xs text-blue-900 dark:text-blue-200">
                        <p className="font-extrabold mb-0.5">Search via CricHeroes</p>
                        <p className="opacity-80 font-medium">Auto-scans for matches this week.</p>
                     </div>
                 </div>

                 {/* Search Type Toggle */}
                 <div className="flex gap-6 border-b border-gray-200/50 dark:border-gray-700/50 pb-3">
                    <label className="flex items-center gap-2 cursor-pointer group select-none">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${searchQuery.searchType === 'link' ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/30' : 'border-gray-400 group-hover:border-gray-500'}`}>
                             {searchQuery.searchType === 'link' && <div className="w-2 h-2 bg-brand-blue rounded-full shadow-sm"></div>}
                        </div>
                        <input 
                            type="radio" 
                            name="searchType" 
                            checked={searchQuery.searchType === 'link'}
                            onChange={() => setSearchQuery({...searchQuery, searchType: 'link'})}
                            className="hidden"
                        />
                         <span className={`text-xs font-bold transition-colors ${searchQuery.searchType === 'link' ? 'text-brand-blue dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>By Link</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer group select-none">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${searchQuery.searchType === 'details' ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/30' : 'border-gray-400 group-hover:border-gray-500'}`}>
                             {searchQuery.searchType === 'details' && <div className="w-2 h-2 bg-brand-blue rounded-full shadow-sm"></div>}
                        </div>
                        <input 
                            type="radio" 
                            name="searchType" 
                            checked={searchQuery.searchType === 'details'}
                            onChange={() => setSearchQuery({...searchQuery, searchType: 'details'})}
                            className="hidden"
                        />
                        <span className={`text-xs font-bold transition-colors ${searchQuery.searchType === 'details' ? 'text-brand-blue dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>By Details</span>
                    </label>
                 </div>

                 {searchQuery.searchType === 'details' ? (
                     <>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1 uppercase tracking-wide">Team Name <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                required
                                className="w-full p-2.5 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 outline-none transition-all placeholder:text-gray-400 backdrop-blur-sm"
                                placeholder="e.g. Royal Strikers XI"
                                value={searchQuery.teamName}
                                onChange={e => setSearchQuery({...searchQuery, teamName: e.target.value})}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1 uppercase tracking-wide">Location</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2.5 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 outline-none transition-all placeholder:text-gray-400 backdrop-blur-sm"
                                    placeholder="e.g. Mumbai"
                                    value={searchQuery.location}
                                    onChange={e => setSearchQuery({...searchQuery, location: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1 uppercase tracking-wide">Captain</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2.5 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 outline-none transition-all placeholder:text-gray-400 backdrop-blur-sm"
                                    placeholder="e.g. Rohit"
                                    value={searchQuery.captainName}
                                    onChange={e => setSearchQuery({...searchQuery, captainName: e.target.value})}
                                />
                            </div>
                        </div>
                     </>
                 ) : (
                    <div>
                         <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1 uppercase tracking-wide">Team Link (CricHeroes/PlayCricket) <span className="text-red-500">*</span></label>
                         <div className="relative group">
                            <input 
                                type="url" 
                                required
                                className="w-full p-2.5 pl-9 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 outline-none transition-all placeholder:text-gray-400 backdrop-blur-sm"
                                placeholder="https://cricheroes.in/team-profile/..."
                                value={searchQuery.teamLink}
                                onChange={e => setSearchQuery({...searchQuery, teamLink: e.target.value})}
                            />
                            <Link size={14} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                         </div>
                         <p className="text-[10px] font-medium text-gray-500 mt-1 ml-1">Paste the full URL of your team's profile page.</p>
                    </div>
                 )}

                 <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} strokeWidth={2.5} />}
                    Find Matches
                </button>
             </form>
        )}

        {mode === 'image' && (
          <div className="space-y-3">
             {imagePreview ? (
               <div className="relative group rounded-xl overflow-hidden border border-white/40 dark:border-gray-700/50 shadow-lg bg-white/50 dark:bg-black/20">
                  <img 
                    src={imagePreview} 
                    alt="Schedule Preview" 
                    className="w-full h-auto max-h-[250px] object-contain bg-gray-100/50 dark:bg-gray-900/50 backdrop-blur-sm p-2" 
                  />
                  
                  <div className="absolute top-2 right-2 opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setImagePreview(null);
                        onClearLogs();
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-md transition-all shadow-sm"
                      title="Remove Image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  
                  {isLoading && (
                     <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                        <div className="bg-white/90 dark:bg-gray-800/90 p-4 rounded-2xl shadow-xl flex flex-col items-center gap-2 animate-in zoom-in-95 duration-200">
                           <Loader2 className="animate-spin text-brand-blue" size={24} />
                           <span className="text-xs font-black text-gray-800 dark:text-gray-200">Scanning Image...</span>
                        </div>
                     </div>
                  )}
               </div>
             ) : (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300/60 dark:border-gray-600/60 rounded-xl p-8 bg-white/30 dark:bg-black/10 hover:bg-white/50 dark:hover:bg-white/5 transition-all cursor-pointer backdrop-blur-sm group"
                   onClick={() => fileInputRef.current?.click()}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    <div className="bg-white/80 dark:bg-gray-700/80 p-3 rounded-full shadow-lg mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="text-brand-orange" size={24} />
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 font-bold mb-0.5 text-sm">Upload Screenshot</p>
                    <p className="text-gray-500 dark:text-gray-500 text-[10px] font-medium text-center">JPG, PNG (Max 5MB)</p>
                </div>
             )}
          </div>
        )}

        {mode === 'text' && (
          <form onSubmit={handleManualSubmit} className="space-y-3">
             <div>
                <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1 uppercase tracking-wide">Opponent Team</label>
                <div className="relative group">
                    <input 
                        type="text" 
                        required
                        className="w-full p-2.5 pl-9 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 outline-none transition-all placeholder:text-gray-400 backdrop-blur-sm"
                        placeholder="e.g. Super Kings"
                        value={manualEntry.opponent}
                        onChange={e => setManualEntry({...manualEntry, opponent: e.target.value})}
                    />
                    <Shield size={14} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1 uppercase tracking-wide">Date</label>
                    <div className="relative group">
                        <input 
                            type="date" 
                            required
                            className="w-full p-2.5 pl-9 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 outline-none transition-all backdrop-blur-sm"
                            value={manualEntry.date}
                            onChange={e => setManualEntry({...manualEntry, date: e.target.value})}
                        />
                        <Calendar size={14} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1 uppercase tracking-wide">Reporting Time</label>
                    <div className="relative group">
                        <input 
                            type="time" 
                            required
                            className="w-full p-2.5 pl-9 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 outline-none transition-all backdrop-blur-sm"
                            value={manualEntry.time}
                            onChange={e => setManualEntry({...manualEntry, time: e.target.value})}
                        />
                        <Clock size={14} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                    </div>
                 </div>
             </div>

             <div>
                <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1 uppercase tracking-wide">Venue</label>
                <div className="relative group">
                    <input 
                        type="text" 
                        required
                        className="w-full p-2.5 pl-9 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 outline-none transition-all placeholder:text-gray-400 backdrop-blur-sm"
                        placeholder="e.g. Oval Ground, Mumbai"
                        value={manualEntry.venue}
                        onChange={e => setManualEntry({...manualEntry, venue: e.target.value})}
                    />
                    <MapPin size={14} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                </div>
             </div>

             <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
            >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} strokeWidth={2.5} />}
                Add Match
            </button>
          </form>
        )}

        {(isLoading || logs.length > 0) && (
            <div className="mt-4">
               <LogConsole logs={logs} isLoading={isLoading} className="rounded-xl max-h-40 border border-gray-700/50 shadow-inner" />
            </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50/80 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-[10px] font-medium rounded-xl border border-red-100 dark:border-red-800/50 flex items-center gap-2 backdrop-blur-sm">
            <span className="font-bold shrink-0 uppercase tracking-wide">Error:</span> {error}
          </div>
        )}
      </div>
    </div>
  );
};