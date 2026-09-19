import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Layers,
  Search,
  HardDrive,
  User as UserIcon,
  X,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { TOOLS, CATEGORIES } from '../../config/tools';
import ToolSearchModal from './ToolSearchModal';
import AuthModal from './AuthModal';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isGoogleUser, isDemoUser, signOut } = useAuth();

  const [toolsSheetOpen, setToolsSheetOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const isActive = (path: string) => location.pathname === path;

  const filteredTools = activeCategory === 'all'
    ? TOOLS
    : TOOLS.filter(t => t.category === activeCategory);

  return (
    <>
      {/* Fixed Mobile Bottom Navigation Bar (Hidden on desktop lg:) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* 1. Home */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-all active:scale-95 touch-manipulation ${
              isActive('/') ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Home className="w-5 h-5" />
              {isActive('/') && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-600 rounded-full"
                />
              )}
            </div>
            <span className="text-[10px] mt-0.5 font-medium">Home</span>
          </Link>

          {/* 2. Quick Tools Sheet Trigger */}
          <button
            type="button"
            onClick={() => setToolsSheetOpen(true)}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-all active:scale-95 touch-manipulation ${
              toolsSheetOpen ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Layers className="w-5 h-5" />
              {toolsSheetOpen && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-600 rounded-full" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 font-medium">All Tools</span>
          </button>

          {/* 3. Fast Search */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl text-slate-500 hover:text-slate-800 transition-all active:scale-95 touch-manipulation"
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Search</span>
          </button>

          {/* 4. Document Vault */}
          <Link
            to="/vault"
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-all active:scale-95 touch-manipulation ${
              isActive('/vault') ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <HardDrive className="w-5 h-5" />
              {isActive('/vault') && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-600 rounded-full"
                />
              )}
            </div>
            <span className="text-[10px] mt-0.5 font-medium">Vault</span>
          </Link>

          {/* 5. User Account / Fast Login */}
          <button
            type="button"
            onClick={() => {
              if (user) {
                setProfileSheetOpen(true);
              } else {
                setAuthModalOpen(true);
              }
            }}
            className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl text-slate-500 hover:text-slate-800 transition-all active:scale-95 touch-manipulation"
          >
            {user ? (
              <div className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            ) : (
              <UserIcon className="w-5 h-5" />
            )}
            <span className="text-[10px] mt-0.5 font-medium">
              {user ? (isGoogleUser ? 'Google' : 'Account') : 'Sign In'}
            </span>
          </button>
        </div>
      </nav>

      {/* Quick Tools Mobile Bottom Sheet */}
      <AnimatePresence>
        {toolsSheetOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs lg:hidden"
            onClick={() => setToolsSheetOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle & Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg text-slate-900">PDF Tools Hub</h3>
                  <p className="text-xs text-slate-500">22 high-performance browser tools</p>
                </div>
                <button
                  onClick={() => setToolsSheetOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter Chips */}
              <div className="flex gap-2 px-4 py-2.5 overflow-x-auto border-b border-slate-100 scrollbar-none">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap min-h-[36px] ${
                    activeCategory === 'all'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All ({TOOLS.length})
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap min-h-[36px] ${
                      activeCategory === cat.id
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat.labelKey.replace('cat.', '').toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Tools List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[60vh]">
                {filteredTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setToolsSheetOpen(false);
                      navigate(tool.route);
                    }}
                    className="w-full p-3.5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-rose-50/50 hover:border-rose-200 text-left flex items-center justify-between transition-all active:scale-[0.98] min-h-[52px] touch-manipulation"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-xs"
                        style={{ backgroundColor: tool.color + '15', color: tool.color }}
                      >
                        ⚡
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">{tool.name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{tool.shortDesc}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Details Mobile Bottom Sheet */}
      <AnimatePresence>
        {profileSheetOpen && user && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs lg:hidden"
            onClick={() => setProfileSheetOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-white rounded-t-3xl shadow-2xl p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-black text-lg text-slate-900">Your Account</h3>
                <button
                  onClick={() => setProfileSheetOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {profile?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-black text-sm text-slate-900">
                    {profile?.name || user.user_metadata?.name || user.email?.split('@')[0]}
                  </div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>{isGoogleUser ? 'Google Authenticated' : isDemoUser ? 'Demo Pro' : 'Active Account'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  to="/vault"
                  onClick={() => setProfileSheetOpen(false)}
                  className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between min-h-[44px]"
                >
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-rose-600" />
                    <span>My Cloud Document Vault</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  to="/history"
                  onClick={() => setProfileSheetOpen(false)}
                  className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between min-h-[44px]"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Processing History & Stats</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>

                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    setProfileSheetOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-colors min-h-[44px] cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Modals */}
      <ToolSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default MobileBottomNav;
