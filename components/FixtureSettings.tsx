import React from 'react';
import { IndianRupee, Phone, Wallet } from 'lucide-react';

interface FixtureSettingsProps {
  fees: string;
  setFees: (val: string) => void;
  payTo: string;
  setPayTo: (val: string) => void;
}

export const FixtureSettings: React.FC<FixtureSettingsProps> = ({ fees, setFees, payTo, setPayTo }) => {
  return (
    <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 dark:border-gray-700/50 p-3 animate-in fade-in duration-300 hover:shadow-2xl hover:shadow-blue-500/5 transition-all">
      <div className="flex items-center gap-2 mb-2">
          <div className="bg-brand-orange/10 p-1.5 rounded-lg text-brand-orange">
            <Wallet size={16} />
          </div>
          <h3 className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-wide">Match Essentials</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
           <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1 ml-1 uppercase tracking-wide">
              <IndianRupee size={10} strokeWidth={2.5} /> Match Fees
           </label>
           <input
              type="text"
              value={fees}
              onChange={(e) => setFees(e.target.value)}
              placeholder="e.g. 500"
              className="w-full px-3 py-2 text-xs font-semibold bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 dark:text-white transition-all placeholder-gray-400 backdrop-blur-sm"
           />
        </div>
        <div>
           <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1 ml-1 uppercase tracking-wide">
              <Phone size={10} strokeWidth={2.5} /> Manager Number
           </label>
           <input
              type="text"
              value={payTo}
              onChange={(e) => setPayTo(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full px-3 py-2 text-xs font-semibold bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 dark:text-white transition-all placeholder-gray-400 backdrop-blur-sm"
           />
        </div>
      </div>
    </div>
  );
};