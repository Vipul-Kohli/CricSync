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
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'image', icon: Camera, label: 'Scan' },
    { id: 'text', icon: TypeIcon, label: 'Manual' }
  ] as const;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-soft overflow-hidden">
      
      {/* Segmented Tab Control */}
      <div className="p-2">
        <div className="bg-brand-input dark:bg-gray-900 p-1.5 rounded-2xl flex relative">
            {tabs.map((tab) => {
                const isActive = mode === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onModeChange(tab.id as InputMode)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all relative z-10 ${
                            isActive ? 'text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        <tab.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                        {tab.label}
                    </button>
                )
            })}
            {/* Animated Background Pill */}
            <div 
                className="absolute top-1.5 bottom-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-all duration-300"
                style={{
                    left: mode === 'search' ? '6px' : mode === 'image' ? '33.33%' : '66.66%',
                    width: 'calc(33.33% - 4px)',
                    transform: mode !== 'search' ? 'translateX(0px)' : 'translateX(0)' 
                }}
            />
        </div>
      </div>

      <div className="p-6 pt-2">
        {mode === 'search' && (
             <form onSubmit={handleSearchSubmit} className="space-y-5">
                 <div className="flex gap-4">
                    <label className={`flex-1 cursor-pointer border-2 rounded-2xl p-3 flex flex-col items-center gap-2 transition-all ${searchQuery.searchType === 'link' ? 'border-brand-blue bg-blue-50/50 dark:bg-blue-900/20' : 'border-transparent bg-brand-input dark:bg-gray-900'}`}>
                        <input 
                            type="radio" 
                            name="searchType" 
                            checked={searchQuery.searchType === 'link'}
                            onChange={() => setSearchQuery({...searchQuery, searchType: 'link'})}
                            className="hidden"
                        />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${searchQuery.searchType === 'link' ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <Link size={16} />
                        </div>
                        <span className={`text-xs font-bold ${searchQuery.searchType === 'link' ? 'text-brand-blue' : 'text-gray-500'}`}>By Link</span>
                    </label>

                    <label className={`flex-1 cursor-pointer border-2 rounded-2xl p-3 flex flex-col items-center gap-2 transition-all ${searchQuery.searchType === 'details' ? 'border-brand-blue bg-blue-50/50 dark:bg-blue-900/20' : 'border-transparent bg-brand-input dark:bg-gray-900'}`}>
                        <input 
                            type="radio" 
                            name="searchType" 
                            checked={searchQuery.searchType === 'details'}
                            onChange={() => setSearchQuery({...searchQuery, searchType: 'details'})}
                            className="hidden"
                        />
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center ${searchQuery.searchType === 'details' ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <Globe size={16} />
                        </div>
                        <span className={`text-xs font-bold ${searchQuery.searchType === 'details' ? 'text-brand-blue' : 'text-gray-500'}`}>By Details</span>
                    </label>
                 </div>

                 {searchQuery.searchType === 'details' ? (
                     <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Team Name</label>
                            <input 
                                type="text" 
                                required
                                className="w-full bg-brand-input dark:bg-gray-900 px-4 py-3.5 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue/20"
                                placeholder="e.g. Royal Strikers XI"
                                value={searchQuery.teamName}
                                onChange={e => setSearchQuery({...searchQuery, teamName: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Location</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-brand-input dark:bg-gray-900 px-4 py-3.5 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue/20"
                                    placeholder="e.g. Mumbai"
                                    value={searchQuery.location}
                                    onChange={e => setSearchQuery({...searchQuery, location: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Captain</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-brand-input dark:bg-gray-900 px-4 py-3.5 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue/20"
                                    placeholder="e.g. Rohit"
                                    value={searchQuery.captainName}
                                    onChange={e => setSearchQuery({...searchQuery, captainName: e.target.value})}
                                />
                            </div>
                        </div>
                     </div>
                 ) : (
                    <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Profile Link</label>
                         <input 
                            type="url" 
                            required
                            className="w-full bg-brand-input dark:bg-gray-900 px-4 py-3.5 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue/20 text-brand-blue underline"
                            placeholder="https://cricheroes.in/..."
                            value={searchQuery.teamLink}
                            onChange={e => setSearchQuery({...searchQuery, teamLink: e.target.value})}
                         />
                    </div>
                 )}

                 <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-blue hover:bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} strokeWidth={2.5} />}
                    Find Matches
                </button>
             </form>
        )}

        {mode === 'image' && (
          <div className="space-y-4">
             {imagePreview ? (
               <div className="relative rounded-3xl overflow-hidden shadow-md">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full bg-gray-100" 
                  />
                  <button 
                      onClick={() => {
                        setImagePreview(null);
                        onClearLogs();
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-3 right-3 bg-white text-gray-900 p-2 rounded-full shadow-lg"
                    >
                      <X size={16} />
                    </button>
                  
                  {isLoading && (
                     <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-brand-blue mb-2" size={32} />
                        <span className="text-xs font-bold text-gray-500">Extracting Data...</span>
                     </div>
                  )}
               </div>
             ) : (
                <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-brand-blue mb-4">
                      <Camera size={28} />
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Upload Screenshot</p>
                    <p className="text-xs text-gray-400 mt-1">Tap to browse gallery</p>
                </div>
             )}
          </div>
        )}

        {mode === 'text' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
             <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Opponent</label>
                <div className="relative">
                    <input 
                        type="text" 
                        required
                        className="w-full bg-brand-input dark:bg-gray-900 pl-11 pr-4 py-3.5 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-blue/20"
                        placeholder="Team Name"
                        value={manualEntry.opponent}
                        onChange={e => setManualEntry({...manualEntry, opponent: e.target.value})}
                    />
                    <Shield className="absolute left-4 top-3.5 text-gray-400" size={18} />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Date</label>
                    <div className="relative">
                        <input 
                            type="date" 
                            required
                            className="w-full bg-brand-input dark:bg-gray-900 pl-11 pr-4 py-3.5 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-blue/20"
                            value={manualEntry.date}
                            onChange={e => setManualEntry({...manualEntry, date: e.target.value})}
                        />
                        <Calendar className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Time</label>
                    <div className="relative">
                        <input 
                            type="time" 
                            required
                            className="w-full bg-brand-input dark:bg-gray-900 pl-11 pr-4 py-3.5 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-blue/20"
                            value={manualEntry.time}
                            onChange={e => setManualEntry({...manualEntry, time: e.target.value})}
                        />
                        <Clock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    </div>
                 </div>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Venue</label>
                <div className="relative">
                    <input 
                        type="text" 
                        required
                        className="w-full bg-brand-input dark:bg-gray-900 pl-11 pr-4 py-3.5 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-blue/20"
                        placeholder="Stadium Name"
                        value={manualEntry.venue}
                        onChange={e => setManualEntry({...manualEntry, venue: e.target.value})}
                    />
                    <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
                </div>
             </div>

             <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-blue hover:bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 mt-2"
            >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} strokeWidth={2.5} />}
                Add Match
            </button>
          </form>
        )}

        {/* Inline Logs */}
        {(isLoading || logs.length > 0) && (
            <div className="mt-6">
               <LogConsole logs={logs} isLoading={isLoading} className="rounded-2xl max-h-32 border border-gray-100 dark:border-gray-800" />
            </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3 text-xs font-medium">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                <X size={12} strokeWidth={3} />
            </div>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};