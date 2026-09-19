import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { handleGoogleRedirect } from './lib/googleAuth';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';

// Pages
import Home from './pages/Home';
import ToolPage from './pages/ToolPage';
import HistoryPage from './pages/HistoryPage';
import VaultPage from './pages/VaultPage';
import PricingPage from './pages/PricingPage';
import PrivacyPage from './pages/PrivacyPage';

// Handle Google redirect fallback
handleGoogleRedirect();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="w-full flex-1"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/vault" element={<VaultPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/:toolId" element={<ToolPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <WorkflowProvider>
          <ToastProvider>
            <BrowserRouter>
              <div className="min-h-screen flex flex-col bg-[#fdfdfd] text-slate-900 font-sans selection:bg-rose-500 selection:text-white pb-20 lg:pb-0">
                <Header />
                <div className="flex-1 flex flex-col">
                  <AnimatedRoutes />
                </div>
                <Footer />
                <MobileBottomNav />
              </div>
            </BrowserRouter>
          </ToastProvider>
        </WorkflowProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
