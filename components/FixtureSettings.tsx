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
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-soft">
      <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-brand-orange">
            <Wallet size={16} strokeWidth={2.5} />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Match Essentials</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
           <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-wide flex items-center gap-1">
              <IndianRupee size={10} /> Match Fees
           </label>
           <input
              type="text"
              value={fees}
              onChange={(e) => setFees(e.target.value)}
              placeholder="e.g. 500"
              className="w-full bg-brand-input dark:bg-gray-900 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all placeholder:text-gray-400 placeholder:font-normal"
           />
        </div>
        <div className="space-y-1.5">
           <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-wide flex items-center gap-1">
              <Phone size={10} /> Manager Number
           </label>
           <input
              type="text"
              value={payTo}
              onChange={(e) => setPayTo(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full bg-brand-input dark:bg-gray-900 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all placeholder:text-gray-400 placeholder:font-normal"
           />
        </div>
      </div>
    </div>
  );
};