import React, { useState } from 'react';
import { MessageCircle, Instagram, Link, CheckCircle2, ArrowRight } from 'lucide-react';

interface SocialSetupProps {
    waLink: string;
    setWaLink: (link: string) => void;
    waConnected: boolean;
    setWaConnected: (connected: boolean) => void;
}

export const SocialSetup: React.FC<SocialSetupProps> = ({ waLink, setWaLink, waConnected, setWaConnected }) => {
  const [instaId, setInstaId] = useState('');
  const [instaToken, setInstaToken] = useState('');
  const [instaConnected, setInstaConnected] = useState(false);

  return (
    <div className="space-y-3">
        {/* WhatsApp Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-soft">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><MessageCircle size={16} /></div>
                    <h3 className="text-base font-bold">WhatsApp Group</h3>
                </div>
                {waConnected && <div className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[9px] font-bold">CONNECTED</div>}
            </div>
            
            {!waConnected ? (
                <form onSubmit={(e) => { e.preventDefault(); if(waLink) setWaConnected(true); }} className="space-y-3">
                    <input 
                        type="url" 
                        required
                        placeholder="Group Invite Link"
                        className="w-full bg-brand-input px-3 py-2.5 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500/20"
                        value={waLink}
                        onChange={(e) => setWaLink(e.target.value)}
                    />
                    <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">Connect <ArrowRight size={16} /></button>
                </form>
            ) : (
                <div className="text-center p-3 bg-green-50 rounded-xl">
                    <p className="text-green-800 font-bold text-sm">Group Linked Successfully</p>
                    <button onClick={() => setWaConnected(false)} className="text-xs text-green-600 font-bold mt-1 hover:underline">Disconnect</button>
                </div>
            )}
        </div>

        {/* Instagram Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-soft">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center"><Instagram size={16} /></div>
                    <h3 className="text-base font-bold">Instagram API</h3>
                </div>
                {instaConnected && <div className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[9px] font-bold">CONNECTED</div>}
            </div>

            {!instaConnected ? (
                <form onSubmit={(e) => { e.preventDefault(); if(instaId) setInstaConnected(true); }} className="space-y-3">
                    <input 
                        type="text" 
                        placeholder="Business ID"
                        className="w-full bg-brand-input px-3 py-2.5 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-pink-500/20"
                        value={instaId}
                        onChange={(e) => setInstaId(e.target.value)}
                    />
                     <input 
                        type="password" 
                        placeholder="Access Token"
                        className="w-full bg-brand-input px-3 py-2.5 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-pink-500/20"
                        value={instaToken}
                        onChange={(e) => setInstaToken(e.target.value)}
                    />
                    <button type="submit" className="w-full bg-pink-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">Save Config <ArrowRight size={16} /></button>
                </form>
            ) : (
                <div className="text-center p-3 bg-pink-50 rounded-xl">
                    <p className="text-pink-800 font-bold text-sm">API Configured</p>
                    <button onClick={() => setInstaConnected(false)} className="text-xs text-pink-600 font-bold mt-1 hover:underline">Clear Config</button>
                </div>
            )}
        </div>
    </div>
  );
};