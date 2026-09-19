import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  Globe,
  User as UserIcon,
  HardDrive,
  Clock,
  Sparkles,
  ChevronDown,
  Layers,
  Scissors,
  Minimize2,
  FileText,
  PenTool,
  Lock,
  RotateCw,
  Stamp,
  CheckCircle2,
  FileSignature
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, type LanguageCode } from '../../contexts/LanguageContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { TOOLS } from '../../config/tools';
import ToolSearchModal from './ToolSearchModal';
import AuthModal from './AuthModal';
import BrandLogo from '../common/BrandLogo';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
  const { user, profile, signOut, isDemoUser, isGoogleUser } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { activeFile, clearActiveFile } = useWorkflow();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState<string | null>(null);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', label: 'Português', flag: '🇵🇹' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
        {/* Connected active workflow banner */}
        {activeFile && (
          <div className="bg-emerald-600 text-white text-xs font-medium px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 max-w-2xl truncate">
              <Sparkles className="w-4 h-4 flex-shrink-0 animate-pulse text-amber-300" />
              <span>
                Active Document in Workspace: <strong>{activeFile.name}</strong> ({(activeFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/organize-pdf')}
                className="bg-white text-emerald-800 text-[11px] px-2.5 py-0.5 rounded font-bold hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Organize Pages
              </button>
              <button
                onClick={() => navigate('/watermark-pdf')}
                className="bg-white text-emerald-800 text-[11px] px-2.5 py-0.5 rounded font-bold hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Watermark
              </button>
              <button
                onClick={clearActiveFile}
                className="text-emerald-100 hover:text-white text-xs ml-2 cursor-pointer"
                title="Clear active workspace document"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center">
                <BrandLogo size="md" />
              </Link>

              {/* Desktop Nav Links with Dropdowns */}
              <nav className="hidden lg:flex items-center space-x-1 text-sm font-semibold text-gray-700">
                <Link
                  to="/merge-pdf"
                  className="px-3 py-2 rounded-lg hover:text-[#e5322d] hover:bg-red-50 transition-colors"
                >
                  {t('nav.merge')}
                </Link>
                <Link
                  to="/split-pdf"
                  className="px-3 py-2 rounded-lg hover:text-[#e5322d] hover:bg-red-50 transition-colors"
                >
                  {t('nav.split')}
                </Link>
                <Link
                  to="/compress-pdf"
                  className="px-3 py-2 rounded-lg hover:text-[#e5322d] hover:bg-red-50 transition-colors"
                >
                  {t('nav.compress')}
                </Link>

                {/* Convert PDF dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setMegaMenuOpen('convert')}
                  onMouseLeave={() => setMegaMenuOpen(null)}
                >
                  <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:text-[#e5322d] hover:bg-red-50 transition-colors cursor-pointer">
                    <span>{t('nav.convert')}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {megaMenuOpen === 'convert' && (
                    <div className="absolute top-full left-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 grid grid-cols-1 gap-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2">
                        Convert to & from PDF
                      </div>
                      <Link
                        to="/jpg-to-pdf"
                        onClick={() => setMegaMenuOpen(null)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-red-50 text-gray-800 hover:text-[#e5322d] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          JPG
                        </div>
                        <div>
                          <div className="font-semibold text-sm">JPG to PDF</div>
                          <div className="text-xs text-gray-500">Convert images to document</div>
                        </div>
                      </Link>
                      <Link
                        to="/pdf-to-jpg"
                        onClick={() => setMegaMenuOpen(null)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-red-50 text-gray-800 hover:text-[#e5322d] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">
                          PDF
                        </div>
                        <div>
                          <div className="font-semibold text-sm">PDF to JPG</div>
                          <div className="text-xs text-gray-500">Extract pages into images / ZIP</div>
                        </div>
                      </Link>
                      <Link
                        to="/pdf-to-text"
                        onClick={() => setMegaMenuOpen(null)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-red-50 text-gray-800 hover:text-[#e5322d] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                          TXT
                        </div>
                        <div>
                          <div className="font-semibold text-sm">PDF to Text</div>
                          <div className="text-xs text-gray-500">Extract readable text</div>
                        </div>
                      </Link>
                      <Link
                        to="/ocr-pdf"
                        onClick={() => setMegaMenuOpen(null)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-red-50 text-gray-800 hover:text-[#e5322d] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-100 text-[#e5322d] flex items-center justify-center font-bold text-xs">
                          OCR
                        </div>
                        <div>
                          <div className="font-semibold text-sm">OCR PDF</div>
                          <div className="text-xs text-gray-500">Scan & recognize document text</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* All PDF Tools Mega Menu */}
                <div
                  className="relative"
                  onMouseEnter={() => setMegaMenuOpen('all')}
                  onMouseLeave={() => setMegaMenuOpen(null)}
                >
                  <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-900 text-white hover:bg-[#e5322d] transition-colors cursor-pointer font-bold text-xs uppercase tracking-wider">
                    <span>{t('nav.all_tools')}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  </button>

                  {megaMenuOpen === 'all' && (
                    <div className="absolute top-full -left-20 w-[680px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 grid grid-cols-3 gap-6 z-50 animate-in fade-in slide-in-from-top-2">
                      {/* Organize */}
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                          <Layers className="w-3.5 h-3.5 text-[#e5322d]" />
                          <span>Organize</span>
                        </div>
                        <div className="space-y-1.5">
                          <Link to="/merge-pdf" onClick={() => setMegaMenuOpen(null)} className="block text-sm text-gray-700 hover:text-[#e5322d] hover:font-bold py-1">Merge PDF</Link>
                          <Link to="/split-pdf" onClick={() => setMegaMenuOpen(null)} className="block text-sm text-gray-700 hover:text-[#e5322d] hover:font-bold py-1">Split PDF</Link>
                          <Link to="/organize-pdf" onClick={() => setMegaMenuOpen(null)} className="block text-sm text-gray-700 hover:text-[#e5322d] hover:font-bold py-1">Organize & Delete</Link>
                          <Link to="/rotate-pdf" onClick={() => setMegaMenuOpen(null)} className="block text-sm text-gray-700 hover:text-[#e5322d] hover:font-bold py-1">Rotate PDF</Link>
                        </div>
                      </div>

                      {/* Edit & Security */}
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                          <PenTool className="w-3.5 h-3.5 text-purple-600" />
                          <span>Edit & Sign</span>
                        </div>
                        <div className="space-y-1.5">
                          <Link to="/sign-pdf" onClick={() => setMegaMenuOpen(null)} className="block text-sm text-gray-700 hover:text-[#e5322d] hover:font-bold py-1">Sign PDF / eSign</Link>
                          <Link to="/watermark-pdf" onClick={() => setMegaMenuOpen(null)} className="block text-sm text-gray-700 hover:text-[#e5322d] hover:font-bold py-1">Watermark PDF</Link>
                          <Link to="/page-numbers" onClick={() => setMegaMenuOpen(null)} className="block text-sm text-gray-700 hover:text-[#e5322d] hover:font-bold py-1">Page Numbers</Link>
                          <Link to="/add-text" onClick={() => setMegaMenuOpen(null)} className="block text-sm text-gray-700 hover:text-[#e5322d] hover:font-bold py-1">Add Text / Notes</Link>
                          <Link to="/edit-pdf" onClick={() => setMegaMenuOpen(null)} className="block text-sm text-gray-700 hover:text-[#e5322d] hover:font-bold py-1">Edit PDF Canvas</Link>
                        </div>
                      </div>

                      {/* Security & Optimize */}
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                          <Lock className="w-3.5 h-3.5 text-red-600" />
                          <span>Security & More</span>
                        </div>
                        <div className="space-y-1.5">
                          <Link to="/compress-pdf" onClick={() => setMegaMenuOpen(null)} className="block text-sm text-gray-700 hover:text-[#e5322d] hover:font-bold py-1">Compress PDF</Link>
                          <Link to="/protect-pdf" onClick={() => setMegaMenuOpen(null)} className="block text-sm text-gray-700 hover:text-[#e5322d] hover:font-bold py-1">Protect PDF</Link>
                          <Link to="/unlock-pdf" onClick={() => setMegaMenuOpen(null)} className="block text-sm text-gray-700 hover:text-[#e5322d] hover:font-bold py-1">Unlock PDF</Link>
                          <Link to="/redact-pdf" onClick={() => setMegaMenuOpen(null)} className="block text-sm text-gray-700 hover:text-[#e5322d] hover:font-bold py-1">Redact PDF</Link>
                          <Link to="/repair-pdf" onClick={() => setMegaMenuOpen(null)} className="block text-sm text-gray-700 hover:text-[#e5322d] hover:font-bold py-1">Repair PDF</Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2.5">
              {/* Search Modal Trigger */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                title="Search Tools (Cmd+K)"
              >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-[10px] text-gray-500 font-mono">
                  ⌘K
                </span>
              </button>

              {/* History & Stats Link */}
              <Link
                to="/history"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span>{t('nav.history')}</span>
              </Link>

              {/* Cloud Vault Link */}
              <Link
                to="/vault"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HardDrive className="w-3.5 h-3.5 text-gray-500" />
                <span>{t('nav.vault')}</span>
              </Link>

              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="uppercase">{lang}</span>
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-red-50 hover:text-[#e5322d] transition-colors cursor-pointer ${
                          lang === l.code ? 'text-[#e5322d] font-bold bg-red-50/50' : 'text-gray-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.label}</span>
                        </span>
                        {lang === l.code && <CheckCircle2 className="w-3.5 h-3.5 text-[#e5322d]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Account / Login */}
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-800 border border-slate-200 shadow-xs">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">
                        {profile?.name ? profile.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="max-w-[110px] truncate">{profile?.name || user.email?.split('@')[0]}</span>
                    {isGoogleUser && (
                      <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Google
                      </span>
                    )}
                    {isDemoUser && (
                      <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">
                        PRO
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="text-xs font-semibold text-slate-500 hover:text-rose-600 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer min-h-[36px]"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-rose-600 transition-colors cursor-pointer min-h-[44px] flex items-center"
                  >
                    {t('nav.login')}
                  </button>
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-all cursor-pointer min-h-[44px] flex items-center gap-1.5 active:scale-95"
                  >
                    <span>{t('nav.signup')}</span>
                  </button>
                </div>
              )}

              {/* Mobile menu toggle (touch friendly min 44px) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer active:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-6 space-y-4 animate-in slide-in-from-top-2">
            {/* Quick Google Sign In banner if logged out */}
            {!user ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-xs text-slate-900">Sync with Google</div>
                  <div className="text-[11px] text-slate-500">1-tap social login for quick access</div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="px-3 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 cursor-pointer min-h-[40px]"
                >
                  Sign In ⚡
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{profile?.name || user.email?.split('@')[0]}</div>
                    <div className="text-[10px] text-slate-500">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-xs text-rose-600 font-bold hover:underline py-1 px-2"
                >
                  Logout
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Link
                to="/merge-pdf"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3.5 bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2 active:scale-95 transition-transform"
              >
                <Layers className="w-4 h-4 text-rose-600" /> Merge PDF
              </Link>
              <Link
                to="/split-pdf"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3.5 bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2 active:scale-95 transition-transform"
              >
                <Scissors className="w-4 h-4 text-rose-600" /> Split PDF
              </Link>
              <Link
                to="/compress-pdf"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3.5 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-2 active:scale-95 transition-transform"
              >
                <Minimize2 className="w-4 h-4 text-emerald-600" /> Compress PDF
              </Link>
              <Link
                to="/sign-pdf"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3.5 bg-purple-50 text-purple-700 rounded-xl flex items-center gap-2 active:scale-95 transition-transform"
              >
                <FileSignature className="w-4 h-4 text-purple-600" /> Sign PDF
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-sm font-medium text-slate-700">
              <Link to="/history" onClick={() => setMobileMenuOpen(false)} className="py-2.5 px-3 hover:bg-slate-50 rounded-xl flex items-center gap-2 min-h-[44px]">
                <span>📜</span> <span>Processing History & Telemetry</span>
              </Link>
              <Link to="/vault" onClick={() => setMobileMenuOpen(false)} className="py-2.5 px-3 hover:bg-slate-50 rounded-xl flex items-center gap-2 min-h-[44px]">
                <span>📁</span> <span>Document Cloud Vault</span>
              </Link>
              <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="py-2.5 px-3 hover:bg-slate-50 rounded-xl flex items-center gap-2 min-h-[44px]">
                <span>⭐</span> <span>Pro Features & Pricing</span>
              </Link>
              <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} className="py-2.5 px-3 hover:bg-slate-50 rounded-xl flex items-center gap-2 min-h-[44px]">
                <span>🔒</span> <span>100% Client-Side Privacy Policy</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Tool Search Spotlight Modal */}
      <ToolSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default Header;
