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
    <div className="space-y-6">
        {/* WhatsApp Card */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><MessageCircle size={20} /></div>
                    <h3 className="text-lg font-bold">WhatsApp Group</h3>
                </div>
                {waConnected && <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold">CONNECTED</div>}
            </div>
            
            {!waConnected ? (
                <form onSubmit={(e) => { e.preventDefault(); if(waLink) setWaConnected(true); }} className="space-y-4">
                    <input 
                        type="url" 
                        required
                        placeholder="Group Invite Link"
                        className="w-full bg-brand-input px-4 py-3.5 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-green-500/20"
                        value={waLink}
                        onChange={(e) => setWaLink(e.target.value)}
                    />
                    <button type="submit" className="w-full bg-green-600 text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">Connect <ArrowRight size={16} /></button>
                </form>
            ) : (
                <div className="text-center p-4 bg-green-50 rounded-2xl">
                    <p className="text-green-800 font-bold">Group Linked Successfully</p>
                    <button onClick={() => setWaConnected(false)} className="text-xs text-green-600 font-bold mt-2 hover:underline">Disconnect</button>
                </div>
            )}
        </div>

        {/* Instagram Card */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-soft">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center"><Instagram size={20} /></div>
                    <h3 className="text-lg font-bold">Instagram API</h3>
                </div>
                {instaConnected && <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold">CONNECTED</div>}
            </div>

            {!instaConnected ? (
                <form onSubmit={(e) => { e.preventDefault(); if(instaId) setInstaConnected(true); }} className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Business ID"
                        className="w-full bg-brand-input px-4 py-3.5 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-pink-500/20"
                        value={instaId}
                        onChange={(e) => setInstaId(e.target.value)}
                    />
                     <input 
                        type="password" 
                        placeholder="Access Token"
                        className="w-full bg-brand-input px-4 py-3.5 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-pink-500/20"
                        value={instaToken}
                        onChange={(e) => setInstaToken(e.target.value)}
                    />
                    <button type="submit" className="w-full bg-pink-600 text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">Save Config <ArrowRight size={16} /></button>
                </form>
            ) : (
                <div className="text-center p-4 bg-pink-50 rounded-2xl">
                    <p className="text-pink-800 font-bold">API Configured</p>
                    <button onClick={() => setInstaConnected(false)} className="text-xs text-pink-600 font-bold mt-2 hover:underline">Clear Config</button>
                </div>
            )}
        </div>
    </div>
  );
};