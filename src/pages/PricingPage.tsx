import React from 'react';
import { Check, Sparkles, Shield, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export const PricingPage: React.FC = () => {
  const { isDemoUser, loginAsDemo } = useAuth();
  const { showToast } = useToast();

  const handleUpgradeDemo = async () => {
    await loginAsDemo();
    showToast('Pro Plan unlocked for this session!', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12 animate-in fade-in">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-gray-900">Simple, Transparent Plans</h1>
        <p className="text-sm text-gray-500">
          Everything in iLovePDF is free forever. Upgrade to Pro for cloud document sync and priority processing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Tier */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="font-bold text-sm text-gray-500 uppercase tracking-wider">Free Guest Tier</div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-gray-900">$0</span>
              <span className="text-xs text-gray-400">/ forever free</span>
            </div>
            <p className="text-xs text-gray-500">Full access to all 22 PDF tools directly in your browser.</p>

            <ul className="space-y-3 pt-4 border-t border-gray-100 text-xs font-semibold text-gray-700">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> All 22 PDF Tools included</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 100% Client-Side Local Privacy</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> No signup required</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Unlimited document tasks</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Connected tool handoff pipeline</li>
            </ul>
          </div>

          <button
            disabled
            className="w-full py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-bold text-xs cursor-default"
          >
            Currently Active (Default)
          </button>
        </div>

        {/* Pro Tier */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl space-y-6 flex flex-col justify-between border-2 border-amber-400 relative">
          <div className="absolute -top-3.5 right-8 bg-amber-400 text-slate-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
            RECOMMENDED
          </div>

          <div className="space-y-4">
            <div className="font-bold text-sm text-amber-400 uppercase tracking-wider">iLovePDF Pro</div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">$4</span>
              <span className="text-xs text-slate-400">/ month</span>
            </div>
            <p className="text-xs text-slate-300">Cloud document storage, synchronized history across devices.</p>

            <ul className="space-y-3 pt-4 border-t border-slate-700 text-xs font-semibold text-slate-200">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Everything in Free</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Permanent Cloud Document Vault</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Cross-device processing history</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Batch conversion of up to 100 files</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Priority Optical Character Recognition</li>
            </ul>
          </div>

          <button
            onClick={handleUpgradeDemo}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-extrabold text-sm shadow-lg transition-all cursor-pointer"
          >
            {isDemoUser ? 'Pro Activated ✓' : 'Switch to Pro Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
