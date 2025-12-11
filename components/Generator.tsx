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

export const Generator: React.FC<GeneratorProps> = ({ matches, message, onMessageUpdate, onMessageGenerated, defaultFees, defaultPayTo, waLink }) => {
  const [activeTab, setActiveTab] = useState<GeneratorType>('whatsapp');
  const [notes, setNotes] = useState('');
  const [ballColor, setBallColor] = useState('White');
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
    
    if (activeTab === 'instagram' && igType === 'poster') {
        setPosterImage(null);
        onMessageUpdate("");
    }
    
    try {
        let msg = '';
        if (activeTab === 'whatsapp') {
            msg = await generateWhatsAppMessage(matches, 'casual', notes, { fees: defaultFees, payTo: defaultPayTo, ballColor });
            onMessageUpdate(msg);
        } else {
            if (igType === 'poster') {
                const img = await generateMatchPoster(matches);
                if (img) { setPosterImage(img); onMessageUpdate(""); }
                else { setPosterImage(null); onMessageUpdate("Failed to generate poster."); }
            } else {
                msg = await generateInstagramContent(matches, { vibe: igVibe, type: igType });
                onMessageUpdate(msg);
            }
        }
    } catch (e) {
      console.error(e);
      if (igType === 'poster') onMessageUpdate("An error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderMessageWithLinks = (text: string) => {
    return text.split('\n').map((line, lineIndex) => {
        const venueMatch = line.match(/Venue - (.+?)\s+(https?:\/\/[^\s]+)/);
        if (venueMatch) {
             return <div key={lineIndex}>Venue - <a href={venueMatch[2]} target="_blank" className="text-brand-blue font-bold hover:underline">{venueMatch[1]}</a></div>;
        }
        return <div key={lineIndex}>{line}</div>;
    });
  };

  if (matches.length === 0) return <div className="text-center p-10 text-gray-400 font-bold bg-white rounded-[2rem]">No matches to process.</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-soft overflow-hidden">
        {/* Tab Switcher */}
        <div className="p-2">
            <div className="bg-brand-input dark:bg-gray-900 p-1.5 rounded-2xl flex relative">
                <button onClick={() => setActiveTab('whatsapp')} className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all relative z-10 ${activeTab === 'whatsapp' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}>
                    <MessageSquare size={16} /> WhatsApp
                </button>
                <button onClick={() => setActiveTab('instagram')} className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all relative z-10 ${activeTab === 'instagram' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500'}`}>
                    <Instagram size={16} /> Instagram
                </button>
            </div>
        </div>

        <div className="p-6 pt-2 space-y-5">
            {activeTab === 'whatsapp' && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Ball Type</label>
                        <select value={ballColor} onChange={(e) => setBallColor(e.target.value)} className="w-full bg-brand-input px-4 py-3 rounded-2xl text-sm font-semibold outline-none appearance-none">
                            <option value="White">White</option>
                            <option value="Red">Red</option>
                            <option value="Pink">Pink</option>
                            <option value="Tennis">Tennis</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Notes</label>
                        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Extras..." className="w-full bg-brand-input px-4 py-3 rounded-2xl text-sm font-semibold outline-none" />
                    </div>
                </div>
            )}

            {activeTab === 'instagram' && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Type</label>
                        <select value={igType} onChange={(e) => setIgType(e.target.value as any)} className="w-full bg-brand-input px-4 py-3 rounded-2xl text-sm font-semibold outline-none appearance-none">
                            <option value="caption">Caption</option>
                            <option value="story">Story</option>
                            <option value="poster">Poster</option>
                        </select>
                    </div>
                    {igType !== 'poster' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Vibe</label>
                            <select value={igVibe} onChange={(e) => setIgVibe(e.target.value as any)} className="w-full bg-brand-input px-4 py-3 rounded-2xl text-sm font-semibold outline-none appearance-none">
                                <option value="hype">Hype</option>
                                <option value="serious">Serious</option>
                                <option value="fun">Fun</option>
                            </select>
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={handleGenerate}
                disabled={selectedCount === 0 || isGenerating}
                className={`w-full py-4 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 text-white ${activeTab === 'whatsapp' ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' : 'bg-pink-600 hover:bg-pink-700 shadow-pink-500/20'}`}
            >
                {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Wand2 size={20} />}
                {isGenerating ? 'Generating...' : 'Generate Content'}
            </button>

            {/* Content Output */}
            {posterImage && (
                 <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-gray-100"><img src={posterImage} alt="Poster" className="w-full" /></div>
            )}

            {message && !posterImage && (
                <div className="bg-brand-input dark:bg-gray-900 rounded-2xl p-5 relative group">
                    <div className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                        {renderMessageWithLinks(message)}
                    </div>
                    <button onClick={handleCopy} className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'}`}>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>
            )}
            
            {activeTab === 'whatsapp' && waLink && message && (
                <button onClick={() => window.open(waLink, '_blank')} className="w-full bg-green-50 text-green-700 py-3 rounded-2xl font-bold text-sm border border-green-200">
                    Open WhatsApp Group
                </button>
            )}
        </div>
    </div>
  );
};