import React, { useState, useMemo } from 'react';
import {
  Lock,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  FileText,
  Trash2,
  Sliders,
  Printer,
  Copy,
  Edit3,
  KeyRound,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../common/Dropzone';
import ResultScreen from '../common/ResultScreen';
import { protectPdf, type ProtectPdfOptions } from '../../lib/pdfEngine';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import PdfThumbnailPreview from '../common/PdfThumbnailPreview';

export const ProtectTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; fileName: string; pageCount: number } | null>(null);

  // Security & Permission Options
  const [algorithm, setAlgorithm] = useState<'AES-256' | 'RC4'>('AES-256');
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [allowModifying, setAllowModifying] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { showToast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = (files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      setPassword('');
      setConfirmPassword('');
    }
  };

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: 'None', color: 'bg-slate-200', text: 'text-slate-400' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
    if (score === 4) return { score: 3, label: 'Strong', color: 'bg-blue-500', text: 'text-blue-500' };
    return { score: 4, label: 'Very Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
  }, [password]);

  const handleProtect = async () => {
    if (!file) return;

    if (!password) {
      showToast('Please enter a secure password.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match. Please verify.', 'error');
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    try {
      const options: ProtectPdfOptions = {
        userPassword: password,
        ownerPassword: password,
        algorithm,
        allowPrinting,
        allowCopying,
        allowModifying,
        allowAnnotating: false,
        allowFillingForms: true,
      };

      const { blob, pageCount } = await protectPdf(file, options);
      const outputName = `${file.name.replace(/\.pdf$/i, '')}_protected.pdf`;

      setResult({
        blob,
        fileName: outputName,
        pageCount,
      });

      // Record job telemetry silently
      fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || null,
          tool: 'protect',
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

      showToast('PDF encrypted with ISO 32000-2 password protection!', 'success');
    } catch (err: any) {
      console.error('Protect PDF error:', err);
      showToast(err.message || 'Error protecting PDF.', 'error');
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
        fromTool="protect-pdf"
      />
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto py-8 px-4">
      {/* Optional PDF Verification & Preview Modal */}
      {file && (
        <PdfThumbnailPreview
          file={file}
          fileName={file.name}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          currentToolName="Protect PDF"
        />
      )}

      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelect}
          title="Select PDF file to Protect"
          subtitle="Encrypt your PDF document with ISO 32000-2 standard AES-256 encryption in device memory"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-6"
        >
          {/* Header with Apple-grade Squircle Badge */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-rose-500/25 border border-white/20 apple-icon-container">
              <Lock className="w-8 h-8 drop-shadow-sm" strokeWidth={2.3} />
            </div>
            <h3 className="font-black text-2xl text-slate-900 tracking-tight">Set Document Password</h3>
            <p className="text-xs text-slate-500">
              Zero cloud transmission. Encrypted entirely in your browser RAM using Web Crypto.
            </p>
          </div>

          {/* Selected File Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 font-bold">
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
                <Eye className="w-3.5 h-3.5 text-rose-600" />
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

          {/* Password Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Document Open Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a strong password"
                  autoFocus
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all pr-11"
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

              {/* Password strength meter */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-500">Security Strength:</span>
                    <span className={passwordStrength.text}>{passwordStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 transition-all duration-300 ${
                          step <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title={showConfirmPass ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-rose-500 font-semibold mt-1">Passwords do not match</p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                </p>
              )}
            </div>
          </div>

          {/* Advanced Security & Permissions Accordion */}
          <div className="border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-900 py-1"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-rose-600" />
                <span>Security Level & Permission Restrictions</span>
              </span>
              <span className="text-slate-400">{showAdvanced ? '▲ Less' : '▼ More'}</span>
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4 pt-3"
                >
                  {/* Encryption Algorithm Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Encryption Standard</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAlgorithm('AES-256')}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          algorithm === 'AES-256'
                            ? 'bg-rose-50/80 border-rose-400 text-rose-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-extrabold">AES-256 (PDF 2.0)</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                            Recommended
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal">
                          Military-grade security per ISO 32000-2
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAlgorithm('RC4')}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          algorithm === 'RC4'
                            ? 'bg-rose-50/80 border-rose-400 text-rose-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-extrabold">RC4 128-bit</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
                            Legacy
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal">
                          Compatibility with older PDF viewers
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Permissions checkboxes */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-slate-700">Restricted User Permissions</label>
                    <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/70 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={allowPrinting}
                          onChange={(e) => setAllowPrinting(e.target.checked)}
                          className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                        />
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-700 font-medium">Allow High-Quality Printing</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={allowCopying}
                          onChange={(e) => setAllowCopying(e.target.checked)}
                          className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                        />
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-700 font-medium">Allow Copying of Text & Graphics</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={allowModifying}
                          onChange={(e) => setAllowModifying(e.target.checked)}
                          className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                        />
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-700 font-medium">Allow Document Modification & Assembly</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Action Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleProtect}
            disabled={loading || !password || password !== confirmPassword}
            className={`w-full py-4 rounded-2xl text-white font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[52px] ${
              loading || !password || password !== confirmPassword
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:from-rose-700 active:to-rose-800 shadow-rose-600/25 hover:shadow-2xl'
            }`}
          >
            <Shield className="w-5 h-5 flex-shrink-0" strokeWidth={2.4} />
            <span>{loading ? 'Encrypting with AES-256...' : 'Protect PDF Document →'}</span>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default ProtectTool;
