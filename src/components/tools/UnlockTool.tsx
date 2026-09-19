import React, { useState } from 'react';
import {
  Unlock,
  ShieldCheck,
  Eye,
  EyeOff,
  FileText,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Dropzone from '../common/Dropzone';
import ResultScreen from '../common/ResultScreen';
import { unlockPdf } from '../../lib/pdfEngine';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import PdfThumbnailPreview from '../common/PdfThumbnailPreview';

export const UnlockTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; fileName: string; pageCount: number } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { showToast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = (files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      setPassword('');
    }
  };

  const handleUnlock = async () => {
    if (!file) return;

    setLoading(true);
    const startTime = Date.now();
    try {
      const { blob, pageCount } = await unlockPdf(file, password);
      const outputName = `${file.name.replace(/\.pdf$/i, '')}_unlocked.pdf`;

      setResult({
        blob,
        fileName: outputName,
        pageCount,
      });

      fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || null,
          tool: 'unlock',
          execution_mode: 'client',
          status: 'succeeded',
          input_count: 1,
          input_bytes: file.size,
          output_bytes: blob.size,
          page_count: pageCount,
          duration_ms: Date.now() - startTime,
          file_name: outputName,
        }),
      }).catch(console.error);

      showToast('PDF unlocked and encryption restrictions removed!', 'success');
    } catch (err: any) {
      console.error('Unlock error:', err);
      showToast(err.message || 'Error unlocking PDF', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <ResultScreen
        blob={result.blob}
        fileName={result.fileName}
        pageCount={result.pageCount}
        fromTool="unlock-pdf"
      />
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto py-8 px-4">
      {file && (
        <PdfThumbnailPreview
          file={file}
          fileName={file.name}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          currentToolName="Unlock PDF"
        />
      )}

      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelect}
          title="Select PDF file to Unlock"
          subtitle="Remove password security and encryption restrictions locally in browser RAM"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-6"
        >
          {/* Header with Apple-grade Squircle Badge */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25 border border-white/20 apple-icon-container">
              <Unlock className="w-8 h-8 drop-shadow-sm" strokeWidth={2.3} />
            </div>
            <h3 className="font-black text-2xl text-slate-900 tracking-tight">Unlock PDF Document</h3>
            <p className="text-xs text-slate-500">
              Provide the valid password to remove encryption and generate an unprotected document.
            </p>
          </div>

          {/* Selected File Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 font-bold">
                <FileText className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold shadow-2xs hover:bg-slate-100 transition-colors flex items-center gap-1"
                title="Preview document pages"
              >
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Change File"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Enter Document Password <span className="text-slate-400 font-normal">(leave blank if only restricted permissions)</span>
            </label>
            <div className="relative flex items-center">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                autoFocus
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUnlock}
            disabled={loading}
            className={`w-full py-4 rounded-2xl text-white font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[52px] ${
              loading
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:from-amber-600 active:to-amber-700 shadow-amber-500/25 hover:shadow-2xl'
            }`}
          >
            <ShieldCheck className="w-5 h-5 flex-shrink-0" strokeWidth={2.4} />
            <span>{loading ? 'Decrypting Document...' : 'Unlock PDF Document →'}</span>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default UnlockTool;
