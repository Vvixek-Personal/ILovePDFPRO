import React from 'react';
import { Shield, Lock } from 'lucide-react';
import type { ExecutionMode } from '../../types';

interface PrivacyBadgeProps {
  mode?: ExecutionMode;
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ mode = 'client' }) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium shadow-2xs">
      <Shield className="w-3.5 h-3.5 text-emerald-600" />
      <span>
        {mode === 'client'
          ? '🔒 Processed 100% on your device (Client-Side) — files never leave your browser.'
          : '⚡ Encrypted Cloud Engine with automatic zero-retention deletion.'}
      </span>
    </div>
  );
};

export default PrivacyBadge;
