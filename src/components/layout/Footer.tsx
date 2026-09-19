import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Heart, Lock, CheckCircle2, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import BrandLogo from '../common/BrandLogo';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Feature Highlights Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-[#e5322d] flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">100% Client-Side Privacy</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your PDF documents are processed directly in your browser. No files are retained or stored without your explicit choice.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Unified Multi-Tool Pipeline</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamlessly chain operations: Merge, reorder, compress, watermark, and sign documents without repeatedly uploading.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Bank-Grade Encryption</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standard 256-bit encryption for password-protected files, permanent text redactions, and secure electronic signing.
              </p>
            </div>
          </div>
        </div>

        {/* Directory Links */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-8 py-12">
          {/* Col 1 */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">iLovePDF Tools</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/merge-pdf" className="hover:text-white transition-colors">Merge PDF</Link></li>
              <li><Link to="/split-pdf" className="hover:text-white transition-colors">Split PDF</Link></li>
              <li><Link to="/compress-pdf" className="hover:text-white transition-colors">Compress PDF</Link></li>
              <li><Link to="/organize-pdf" className="hover:text-white transition-colors">Organize & Delete</Link></li>
              <li><Link to="/rotate-pdf" className="hover:text-white transition-colors">Rotate PDF</Link></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Convert & OCR</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/jpg-to-pdf" className="hover:text-white transition-colors">JPG to PDF</Link></li>
              <li><Link to="/pdf-to-jpg" className="hover:text-white transition-colors">PDF to JPG</Link></li>
              <li><Link to="/pdf-to-text" className="hover:text-white transition-colors">PDF to Text</Link></li>
              <li><Link to="/text-to-pdf" className="hover:text-white transition-colors">Text to PDF</Link></li>
              <li><Link to="/ocr-pdf" className="hover:text-white transition-colors">OCR Scanned PDF</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Edit & Sign</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/sign-pdf" className="hover:text-white transition-colors">Sign PDF (eSign)</Link></li>
              <li><Link to="/watermark-pdf" className="hover:text-white transition-colors">Watermark PDF</Link></li>
              <li><Link to="/page-numbers" className="hover:text-white transition-colors">Add Page Numbers</Link></li>
              <li><Link to="/add-text" className="hover:text-white transition-colors">Add Text & Notes</Link></li>
              <li><Link to="/edit-pdf" className="hover:text-white transition-colors">Edit PDF Canvas</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Security & Fix</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/protect-pdf" className="hover:text-white transition-colors">Protect PDF</Link></li>
              <li><Link to="/unlock-pdf" className="hover:text-white transition-colors">Unlock PDF</Link></li>
              <li><Link to="/redact-pdf" className="hover:text-white transition-colors">Redact PDF</Link></li>
              <li><Link to="/crop-pdf" className="hover:text-white transition-colors">Crop PDF</Link></li>
              <li><Link to="/repair-pdf" className="hover:text-white transition-colors">Repair PDF</Link></li>
              <li><Link to="/metadata-editor" className="hover:text-white transition-colors">Metadata Editor</Link></li>
            </ul>
          </div>

          {/* Col 5 */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platform & Vault</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/vault" className="hover:text-white transition-colors">Document Cloud Vault</Link></li>
              <li><Link to="/history" className="hover:text-white transition-colors">Processing History</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing & Features</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy & Security</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showSubtitle={false} className="[&_span]:text-white" />
            <span className="hidden sm:inline">•</span>
            <span>© 2026 iLovePDF Platform. Built for fast, private, and secure document workflows.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link to="/pricing" className="hover:text-slate-300">Terms of Service</Link>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for the web
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
