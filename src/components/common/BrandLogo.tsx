import React from 'react';
import { motion } from 'framer-motion';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 rounded-[9px]',
    md: 'w-9 h-9 rounded-[11px]',
    lg: 'w-11 h-11 rounded-[14px]',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 group cursor-pointer select-none ${className}`}>
      {/* Apple-styled SF Squircle Vector Icon with micro-animation */}
      <motion.div
        whileHover={{ scale: 1.08, rotate: -2 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={`relative flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-rose-500 via-rose-600 to-rose-800 text-white shadow-md shadow-rose-500/25 border border-white/20 overflow-hidden ${iconSizes[size]}`}
      >
        {/* Specular gloss top highlight */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

        {/* Crisp vector document fold + heart glyph */}
        <svg
          viewBox="0 0 32 32"
          className="w-5 h-5 drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base Sheet with folded corner */}
          <path
            d="M8 5C6.89543 5 6 5.89543 6 7V25C6 26.1046 6.89543 27 8 27H24C25.1046 27 26 26.1046 26 25V11L20 5H8Z"
            fill="white"
            fillOpacity="0.95"
          />
          {/* Folded tab */}
          <path
            d="M20 5V10C20 10.5523 20.4477 11 21 11H26L20 5Z"
            fill="#CBD5E1"
          />
          {/* Vibrant Heart Icon */}
          <path
            d="M16 16.5C14.8 14.8 12.5 15.2 12.1 16.8C11.6 18.5 13.5 20.3 16 22C18.5 20.3 20.4 18.5 19.9 16.8C19.5 15.2 17.2 14.8 16 16.5Z"
            fill="#E11D48"
          />
        </svg>

        {/* Ambient subtle glow */}
        <div className="absolute -inset-1 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xs pointer-events-none" />
      </motion.div>

      {/* Typography in SF Pro style */}
      <div className="flex flex-col">
        <span
          className={`font-black tracking-[-0.03em] text-slate-900 leading-none ${titleSizes[size]}`}
          style={{ fontFamily: 'var(--font-display, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif)' }}
        >
          iLove<span className="text-rose-600 font-black">PDF</span>
        </span>
        {showSubtitle && (
          <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mt-0.5">
            Online PDF Tools
          </span>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
