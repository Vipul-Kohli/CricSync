import React, { useState } from 'react';
import { MessageSquare, Wand2, Copy, Check, RefreshCw, CircleDot, Instagram, Layers, Image as ImageIcon, Download, AlertTriangle, ExternalLink } from 'lucide-react';
import { Match } from '../types';
import { generateWhatsAppMessage, generateInstagramContent, generateMatchPoster } from '../services/gemini';

interface GeneratorProps {
  matches: Match[];
  message: string;
  onMessageUpdate: (msg: string) => void;
  onMessageGenerated?: (message: string) => void;
  defaultFees: string;
  defaultPayTo: string;
  waLink?: string;
}

type GeneratorType = 'whatsapp' | 'instagram';

export const Generator: React.FC<GeneratorProps> = ({ 
  matches, 
  message, 
  onMessageUpdate, 
  onMessageGenerated,
  defaultFees,
  defaultPayTo,
  waLink
}) => {
  const activeTabState = useState<GeneratorType>('whatsapp');
  const [activeTab, setActiveTab] = activeTabState;
  
  // WhatsApp State
  const [notes, setNotes] = useState('');
  const [ballColor, setBallColor] = useState('White');

  // Instagram State
  const [igVibe, setIgVibe] = useState<'hype' | 'serious' | 'fun'>('hype');
  const [igType, setIgType] = useState<'caption' | 'story' | 'poster'>('caption');
  const [posterImage, setPosterImage] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedCount = matches.filter(m => m.selected).length;

  const handleGenerate = async () => {
    if (selectedCount === 0) return;
    setIsGenerating(true);
    setCopied(false);
    
    // Reset specific states
    if (activeTab === 'instagram' && igType === 'poster') {
        setPosterImage(null);
        onMessageUpdate(""); // Clear previous messages/errors
    }
    
    try {
        let msg = '';
        if (activeTab === 'whatsapp') {
            msg = await generateWhatsAppMessage(matches, 'casual', notes, {
                fees: defaultFees,
                payTo: defaultPayTo,
                ballColor
            });
            onMessageUpdate(msg);
        } else {
            if (igType === 'poster') {
                const img = await generateMatchPoster(matches);
                if (img) {
                    setPosterImage(img);
                    onMessageUpdate(""); // Clear text if image is successful
                } else {
                    setPosterImage(null);
                    onMessageUpdate("Failed to generate poster. The AI model might be busy or the content was filtered. Please try again.");
                }
            } else {
                msg = await generateInstagramContent(matches, {
                    vibe: igVibe,
                    type: igType
                });
                onMessageUpdate(msg);
            }
        }
      
      if (onMessageGenerated && msg) {
        onMessageGenerated(msg);
      }
    } catch (e) {
      console.error(e);
      if (igType === 'poster') {
          onMessageUpdate("An error occurred while generating the poster.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenGroup = () => {
      if (waLink) {
          window.open(waLink, '_blank');
      }
  };

  const handleDownloadPoster = () => {
    if (!posterImage) return;
    const link = document.createElement('a');
    link.href = posterImage;
    link.download = `Match-Poster-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMessageWithLinks = (text: string) => {
    return text.split('\n').map((line, lineIndex) => {
        if (line.trim().startsWith('Venue - ')) {
             const venueMatch = line.match(/Venue - (.+?)\s+(https?:\/\/[^\s]+)/);
             if (venueMatch) {
                 const name = venueMatch[1];
                 const url = venueMatch[2];
                 return (
                     <div key={lineIndex}>
                         Venue - <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">{name}</a>
                     </div>
                 );
             }
        }

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = line.split(urlRegex);
        
        return (
            <div key={lineIndex} className="min-h-[1.2em]">
                {parts.map((part, i) => {
                    if (part.match(urlRegex)) {
                        return (
                            <a 
                                key={i} 
                                href={part} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 dark:text-blue-400 hover:underline break-all font-semibold"
                            >
                                {part}
                            </a>
                        );
                    }
                    return <span key={i}>{part}</span>;
                })}
            </div>
        );
    });
  };

  if (matches.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center p-6 text-center bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 h-48">
            <MessageSquare className="text-gray-400 dark:text-gray-600 mb-3" size={40} />
            <p className="text-gray-600 dark:text-gray-400 font-bold text-base">No matches available</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 font-medium">Extract matches from the Fixtures tab first.</p>
        </div>
    );
  }

  return (
    <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-gray-700/50 overflow-hidden transition-all duration-300">
        {/* Tab Switcher */}
        <div className="flex border-b border-white/20 dark:border-gray-700/50 bg-white/30 dark:bg-gray-900/30">
            <button
                onClick={() => setActiveTab('whatsapp')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all relative ${
                    activeTab === 'whatsapp'
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-gray-500 hover:bg-white/40 dark:hover:bg-white/5'
                }`}
            >
                {activeTab === 'whatsapp' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 shadow-[0_-2px_6px_rgba(34,197,94,0.4)]"></div>
                )}
                <MessageSquare size={14} className={activeTab === 'whatsapp' ? 'drop-shadow-sm' : ''} strokeWidth={2.5} /> WhatsApp
            </button>
            <button
                onClick={() => setActiveTab('instagram')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all relative ${
                    activeTab === 'instagram'
                    ? 'text-pink-700 dark:text-pink-400'
                    : 'text-gray-500 hover:bg-white/40 dark:hover:bg-white/5'
                }`}
            >
                {activeTab === 'instagram' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 shadow-[0_-2px_6px_rgba(236,72,153,0.4)]"></div>
                )}
                <Instagram size={14} className={activeTab === 'instagram' ? 'drop-shadow-sm' : ''} strokeWidth={2.5} /> Insta / Story
            </button>
        </div>

        <div className="p-4 space-y-3">
            
            {/* WhatsApp Options */}
            {activeTab === 'whatsapp' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                             <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1 ml-1 uppercase tracking-wide">
                                <CircleDot size={10} strokeWidth={2.5} /> Ball Type
                            </label>
                            <div className="relative">
                                <select
                                    value={ballColor}
                                    onChange={(e) => setBallColor(e.target.value)}
                                    className="w-full px-3 py-2 text-xs font-semibold bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500/50 outline-none transition-all appearance-none backdrop-blur-sm"
                                >
                                    <option value="White">White</option>
                                    <option value="Red">Red</option>
                                    <option value="Pink">Pink</option>
                                    <option value="Tennis">Tennis</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 ml-1 uppercase tracking-wide">Extra Notes</label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="e.g. Wear whites..."
                                className="w-full px-3 py-2 text-xs font-semibold bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500/50 outline-none transition-all backdrop-blur-sm"
                            />
                        </div>
                    </div>
                    
                    <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                        Using details from Fixtures: Fees <span className="font-bold text-gray-800 dark:text-gray-200">{defaultFees || 'N/A'}</span>, Manager <span className="font-bold text-gray-800 dark:text-gray-200">{defaultPayTo || 'N/A'}</span>
                    </div>
                </div>
            )}

            {/* Instagram Options */}
            {activeTab === 'instagram' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                             <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1 ml-1 uppercase tracking-wide">
                                <Layers size={10} strokeWidth={2.5} /> Content Type
                            </label>
                            <select
                                value={igType}
                                onChange={(e) => setIgType(e.target.value as any)}
                                className="w-full px-3 py-2 text-xs font-semibold bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-pink-500/50 outline-none transition-all appearance-none backdrop-blur-sm"
                            >
                                <option value="caption">Post Caption</option>
                                <option value="story">Story Text</option>
                                <option value="poster">AI Poster (9:16)</option>
                            </select>
                        </div>
                        {igType !== 'poster' && (
                             <div>
                                 <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1 ml-1 uppercase tracking-wide">
                                    <Wand2 size={10} strokeWidth={2.5} /> Vibe
                                </label>
                                <select
                                    value={igVibe}
                                    onChange={(e) => setIgVibe(e.target.value as any)}
                                    className="w-full px-3 py-2 text-xs font-semibold bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-pink-500/50 outline-none transition-all appearance-none backdrop-blur-sm"
                                >
                                    <option value="hype">🔥 Hype / Energetic</option>
                                    <option value="serious">🏏 Serious / Professional</option>
                                    <option value="fun">🎉 Fun / Casual</option>
                                </select>
                            </div>
                        )}
                    </div>
                    
                    <div className="p-2.5 bg-pink-50/50 dark:bg-pink-900/20 rounded-xl text-[10px] text-pink-800 dark:text-pink-300 border border-pink-100 dark:border-pink-800/50 backdrop-blur-sm">
                        <p className="font-bold mb-0.5">
                            {igType === 'caption' ? "Generating a Caption:" : igType === 'story' ? "Generating Story Text:" : "Generating AI Poster:"}
                        </p>
                        <p className="opacity-80 font-medium">
                            {igType === 'caption' 
                                ? "Includes match details, call-to-action, and optimized hashtags." 
                                : igType === 'story'
                                ? "Short, punchy text overlays designed to be placed on top of a photo or background video."
                                : "Generates a unique cricket-themed vertical poster with your match details embedded."}
                        </p>
                    </div>
                </div>
            )}

            <button
                onClick={handleGenerate}
                disabled={selectedCount === 0 || isGenerating}
                className={`w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm ${
                    activeTab === 'whatsapp' 
                        ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-green-500/30' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-pink-500/30'
                }`}
            >
                {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : igType === 'poster' ? <ImageIcon size={18} strokeWidth={2.5} /> : <Wand2 size={18} strokeWidth={2.5} />}
                {isGenerating ? 'Working Magic...' : igType === 'poster' ? 'Generate Poster' : (message ? 'Regenerate Message' : 'Generate Message')}
            </button>

            {/* Generated Poster Display */}
            {activeTab === 'instagram' && igType === 'poster' && posterImage && (
                 <div className="animate-in fade-in zoom-in-95 duration-300 mt-4 flex flex-col items-center">
                    <div className="relative group rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700">
                        <img src={posterImage} alt="Match Poster" className="max-h-[400px] w-auto object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <button 
                                onClick={handleDownloadPoster}
                                className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
                            >
                                <Download size={18} /> Download
                            </button>
                        </div>
                    </div>
                 </div>
            )}

            {/* Generated Text Display (WhatsApp / Insta Text / Errors) */}
            {(!((activeTab === 'instagram' && igType === 'poster') && posterImage)) && message && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className={`relative bg-white/50 dark:bg-black/30 p-4 rounded-2xl shadow-inner border border-white/20 dark:border-gray-700/50 min-h-[100px] transition-all backdrop-blur-md ${activeTab === 'instagram' && igType === 'poster' ? 'border-red-200 bg-red-50/50 dark:bg-red-900/20' : ''}`}>
                        {activeTab === 'instagram' && igType === 'poster' ? (
                             <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                <span className="text-xs font-bold">{message}</span>
                             </div>
                        ) : (
                            <div className="whitespace-pre-wrap text-xs text-gray-900 dark:text-gray-100 font-sans leading-relaxed">
                                {renderMessageWithLinks(message)}
                            </div>
                        )}
                        
                        {!(activeTab === 'instagram' && igType === 'poster') && (
                            <div className="absolute top-3 right-3">
                                <button
                                    onClick={handleCopy}
                                    className={`p-2 rounded-full shadow-sm transition-all backdrop-blur-md border border-white/20 ${
                                        copied 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-white/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-white hover:text-gray-900'
                                    }`}
                                    title="Copy to clipboard"
                                >
                                    {copied ? <Check size={16} strokeWidth={2.5} /> : <Copy size={16} strokeWidth={2.5} />}
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {!(activeTab === 'instagram' && igType === 'poster') && (
                        <div className="mt-2 flex flex-col gap-2">
                             <p className="text-center text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                                {activeTab === 'whatsapp' ? "Ready to paste into WhatsApp!" : "Ready to post on Instagram!"}
                            </p>
                            {activeTab === 'whatsapp' && waLink && (
                                <button
                                    onClick={handleOpenGroup}
                                    className="w-full flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 py-2.5 rounded-xl font-bold text-xs transition-colors border border-green-200 dark:border-green-800/50"
                                >
                                    <ExternalLink size={14} strokeWidth={2.5} /> Open Connected Group
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};