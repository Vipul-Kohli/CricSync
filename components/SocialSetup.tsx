import React, { useState } from 'react';
import { MessageCircle, Instagram, Link, CheckCircle2, AlertCircle, LogOut, ArrowRight, Smartphone, Key, Hash, ExternalLink } from 'lucide-react';

interface SocialSetupProps {
    waLink: string;
    setWaLink: (link: string) => void;
    waConnected: boolean;
    setWaConnected: (connected: boolean) => void;
}

export const SocialSetup: React.FC<SocialSetupProps> = ({ waLink, setWaLink, waConnected, setWaConnected }) => {
  // Instagram Graph API State (Local)
  const [instaId, setInstaId] = useState('');
  const [instaToken, setInstaToken] = useState('');
  const [instaConnected, setInstaConnected] = useState(false);

  const handleWaConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (waLink) {
        setWaConnected(true);
    }
  };

  const handleInstaConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (instaId && instaToken) {
        setInstaConnected(true);
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3 mb-2 px-1">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-xl text-purple-600 dark:text-purple-400 shadow-lg shadow-purple-500/10 border border-purple-200 dark:border-purple-800/50 backdrop-blur-sm">
                <Smartphone size={20} strokeWidth={2.5} />
            </div>
            <div>
                <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">Social Setup</h2>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Auto-posting configuration</p>
            </div>
        </div>

        {/* WhatsApp Section */}
        <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-gray-700/50 overflow-hidden transition-all hover:shadow-2xl hover:shadow-green-500/5">
            <div className="p-3 border-b border-white/20 dark:border-gray-700/50 bg-white/30 dark:bg-gray-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-green-100/50 dark:bg-green-900/30 p-1.5 rounded-lg text-green-600 dark:text-green-400">
                        <MessageCircle size={16} strokeWidth={2.5} />
                    </div>
                    <h3 className="font-black text-lg text-gray-800 dark:text-gray-100">WhatsApp Group</h3>
                </div>
                {waConnected && (
                    <span className="px-2 py-1 rounded-lg bg-green-100/80 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] font-black flex items-center gap-1 backdrop-blur-sm border border-green-200 dark:border-green-800 shadow-sm">
                        <CheckCircle2 size={12} strokeWidth={3} /> CONNECTED
                    </span>
                )}
            </div>
            
            <div className="p-3">
                {!waConnected ? (
                    <form onSubmit={handleWaConnect} className="space-y-3">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                            Connect your team's WhatsApp group to directly share availability polls and match updates.
                        </p>
                        <div>
                            <label className="block text-[10px] font-black text-gray-700 dark:text-gray-300 mb-1 ml-1 uppercase tracking-wide">Group Invite Link</label>
                            <div className="relative group">
                                <input 
                                    type="url" 
                                    required
                                    placeholder="https://chat.whatsapp.com/..."
                                    className="w-full pl-9 pr-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-green-500/50 dark:text-white transition-all backdrop-blur-sm placeholder:font-normal"
                                    value={waLink}
                                    onChange={(e) => setWaLink(e.target.value)}
                                />
                                <Link className="absolute left-3 top-2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={16} />
                            </div>
                        </div>
                        <button 
                            type="submit"
                            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/30 text-sm active:scale-95"
                        >
                            Connect Group <ArrowRight size={16} strokeWidth={2.5} />
                        </button>
                    </form>
                ) : (
                    <div className="bg-white/40 dark:bg-black/20 rounded-xl p-4 border border-white/20 dark:border-gray-700/30 text-center space-y-3">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400 shadow-inner">
                            <MessageCircle size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="font-black text-gray-900 dark:text-white text-base">Group Connected</p>
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ready to Scout & Share</p>
                        </div>
                        <button 
                            onClick={() => { setWaConnected(false); setWaLink(''); }}
                            className="text-[10px] text-red-500 hover:text-red-600 dark:text-red-400 flex items-center justify-center gap-1.5 mx-auto font-bold hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        >
                            <LogOut size={12} strokeWidth={2.5} /> Disconnect
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Instagram Section */}
        <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-gray-700/50 overflow-hidden transition-all hover:shadow-2xl hover:shadow-pink-500/5">
            <div className="p-3 border-b border-white/20 dark:border-gray-700/50 bg-white/30 dark:bg-gray-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-pink-100/50 dark:bg-pink-900/30 p-1.5 rounded-lg text-pink-600 dark:text-pink-400">
                        <Instagram size={16} strokeWidth={2.5} />
                    </div>
                    <h3 className="font-black text-lg text-gray-800 dark:text-gray-100">Instagram Graph API</h3>
                </div>
                {instaConnected && (
                    <span className="px-2 py-1 rounded-lg bg-green-100/80 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] font-black flex items-center gap-1 backdrop-blur-sm border border-green-200 dark:border-green-800 shadow-sm">
                        <CheckCircle2 size={12} strokeWidth={3} /> CONFIGURED
                    </span>
                )}
            </div>

            <div className="p-3">
                {!instaConnected ? (
                    <form onSubmit={handleInstaConnect} className="space-y-3">
                        <div className="bg-pink-50/60 dark:bg-pink-900/20 p-2.5 rounded-xl flex gap-2 items-start text-[10px] font-medium text-pink-800 dark:text-pink-300 border border-pink-100 dark:border-pink-800/50 backdrop-blur-sm">
                            <AlertCircle size={14} className="mt-0.5 shrink-0" strokeWidth={2.5} />
                            <p className="leading-tight">
                                Auto-posting requires a Meta Developer App & Instagram Business Account. 
                                <a 
                                    href="https://developers.facebook.com/docs/instagram-api/getting-started/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="font-bold underline ml-1 hover:text-pink-600 inline-flex items-center gap-0.5"
                                >
                                    Documentation <ExternalLink size={8} />
                                </a>
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-black text-gray-700 dark:text-gray-300 mb-1 ml-1 uppercase tracking-wide">Instagram Business ID</label>
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="178414000..."
                                        className="w-full pl-9 pr-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-pink-500/50 dark:text-white transition-all backdrop-blur-sm font-mono placeholder:font-normal"
                                        value={instaId}
                                        onChange={(e) => setInstaId(e.target.value)}
                                    />
                                    <Hash className="absolute left-3 top-2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={16} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-700 dark:text-gray-300 mb-1 ml-1 uppercase tracking-wide">Graph API Access Token</label>
                                <div className="relative group">
                                    <input 
                                        type="password" 
                                        required
                                        placeholder="EAA..."
                                        className="w-full pl-9 pr-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-pink-500/50 dark:text-white transition-all backdrop-blur-sm font-mono placeholder:font-normal"
                                        value={instaToken}
                                        onChange={(e) => setInstaToken(e.target.value)}
                                    />
                                    <Key className="absolute left-3 top-2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={16} />
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-500/30 text-sm active:scale-95"
                        >
                            Save Configuration <ArrowRight size={16} strokeWidth={2.5} />
                        </button>
                    </form>
                ) : (
                    <div className="bg-white/40 dark:bg-black/20 rounded-xl p-4 border border-white/20 dark:border-gray-700/30 text-center space-y-3">
                         <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/40 rounded-full flex items-center justify-center mx-auto text-pink-600 dark:text-pink-400 shadow-inner">
                            <Instagram size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="font-black text-gray-900 dark:text-white text-base">API Configuration Saved</p>
                            <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-gray-500 dark:text-gray-400 mt-1 bg-white/50 dark:bg-black/30 py-1 px-2 rounded-md mx-auto w-fit">
                                <span className="font-bold">ID:</span> {instaId.slice(0,6)}...{instaId.slice(-4)}
                            </div>
                        </div>
                        <button 
                            onClick={() => { setInstaConnected(false); setInstaId(''); setInstaToken(''); }}
                            className="text-[10px] text-red-500 hover:text-red-600 dark:text-red-400 flex items-center justify-center gap-1.5 mx-auto font-bold hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        >
                            <LogOut size={12} strokeWidth={2.5} /> Clear Config
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};