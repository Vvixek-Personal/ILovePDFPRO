import React, { useRef, useState } from 'react';
import { Upload, FileText, Sparkles, Plus, Image as ImageIcon, Files, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateSamplePdf } from '../../lib/samplePdf';
import { useLanguage } from '../../contexts/LanguageContext';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
  isImage?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFilesSelected,
  accept = '.pdf',
  multiple = true,
  title,
  subtitle,
  isImage = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedCount, setDraggedCount] = useState<number | null>(null);
  const [loadingSample, setLoadingSample] = useState(false);
  const { t } = useLanguage();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    if (e.dataTransfer.items) {
      setDraggedCount(e.dataTransfer.items.length);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only reset if leaving the dropzone container itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
    setDraggedCount(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDraggedCount(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesSelected(multiple ? filesArray : [filesArray[0]]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(multiple ? filesArray : [filesArray[0]]);
    }
  };

  const handleSamplePdfClick = async () => {
    setLoadingSample(true);
    try {
      const sampleFile = await generateSamplePdf('Sample_Document_3Pages.pdf', 3);
      onFilesSelected([sampleFile]);
    } catch (err) {
      console.error('Failed to generate sample PDF:', err);
    } finally {
      setLoadingSample(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 md:p-16 text-center border-2 border-dashed transition-all cursor-pointer select-none overflow-hidden ${
        isDragging
          ? 'border-rose-500 bg-rose-50/80 shadow-xl ring-4 ring-rose-500/20 scale-[1.01]'
          : 'border-slate-300 bg-white hover:border-rose-400/80 hover:bg-slate-50/50 shadow-xs'
      }`}
      onClick={(e) => {
        // Only trigger if not clicking buttons inside
        const target = e.target as HTMLElement;
        if (!target.closest('button')) {
          fileInputRef.current?.click();
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        id="hidden-file-input"
      />

      {/* Drag Over Active Overlay Banner */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 bg-rose-500/90 backdrop-blur-xs z-30 flex flex-col items-center justify-center text-white p-6"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-16 h-16 rounded-2xl bg-white text-rose-600 flex items-center justify-center shadow-2xl mb-3"
            >
              <Files className="w-8 h-8" />
            </motion.div>
            <h4 className="text-xl font-black">Drop your files here</h4>
            <p className="text-xs text-rose-100 mt-1 font-semibold">
              {draggedCount && draggedCount > 1
                ? `Ready to receive ${draggedCount} files at once`
                : 'Batch multi-file upload ready'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Apple-grade Animated Vector Graphic */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          {/* Ambient Glowing Halo */}
          <div className="absolute inset-0 bg-rose-500/10 rounded-full blur-xl animate-pulse-glow pointer-events-none" />

          {/* Floating Document SVG Graphic */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 drop-shadow-lg"
          >
            <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Back Card */}
              <rect x="22" y="10" width="48" height="60" rx="10" fill="#E2E8F0" transform="rotate(6 46 40)" opacity="0.6" />
              {/* Front Sheet */}
              <rect x="18" y="14" width="48" height="60" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
              {/* Folded Corner */}
              <path d="M50 14V22C50 24.2091 51.7909 26 54 26H66L50 14Z" fill="#CBD5E1" />
              {/* Document Text Line Guides */}
              <rect x="26" y="34" width="30" height="3.5" rx="1.75" fill="#E2E8F0" />
              <rect x="26" y="42" width="22" height="3.5" rx="1.75" fill="#E2E8F0" />
              <rect x="26" y="50" width="16" height="3.5" rx="1.75" fill="#E2E8F0" />
              {/* Center Upload Squircle Badge */}
              <g transform="translate(32, 40)">
                <rect width="32" height="32" rx="9" fill="#E11D48" className="shadow-md" />
                <path d="M16 22V10M16 10L11 15M16 10L21 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </svg>
          </motion.div>
        </div>

        {/* Multi-file batch pill indicator */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-bold shadow-2xs">
          <Files className="w-3.5 h-3.5 text-rose-600" />
          <span>{multiple ? 'Multi-File Drag & Drop Enabled' : 'Single Document Mode'}</span>
        </div>

        {/* Primary Action Button (Optimized touch target: 56px height) */}
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group px-9 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:from-rose-700 active:to-rose-800 text-white font-extrabold text-base sm:text-lg shadow-lg shadow-rose-600/25 hover:shadow-xl hover:shadow-rose-600/30 transition-all flex items-center gap-3 cursor-pointer min-h-[54px] touch-manipulation"
        >
          {isImage ? <ImageIcon className="w-6 h-6 flex-shrink-0" strokeWidth={2.2} /> : <Upload className="w-6 h-6 flex-shrink-0" strokeWidth={2.2} />}
          <span>{title || (isImage ? t('btn.select_images') : t('btn.select_files'))}</span>
        </motion.button>

        {/* Subtitle & format guidance */}
        <div className="space-y-1.5 max-w-md mx-auto">
          <p className="text-sm font-semibold text-slate-700">
            {subtitle || t('btn.drop_files')}
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              {isImage ? '.JPG .PNG .WEBP' : '.PDF (ANY VERSION)'}
            </span>
            <span className="text-xs text-slate-400">up to 500 MB per batch</span>
          </div>
        </div>

        {/* Quick Sample File Trigger */}
        {!isImage && (
          <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleSamplePdfClick}
              disabled={loadingSample}
              className="px-4 py-2 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-2xs min-h-[44px] touch-manipulation"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{loadingSample ? 'Generating Sample...' : t('btn.sample_pdf')}</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dropzone;
