import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Scissors,
  Minimize2,
  FileImage,
  Image as ImageIcon,
  LayoutGrid,
  RotateCw,
  Stamp,
  ListOrdered,
  FileSignature,
  Type,
  Lock,
  Unlock,
  PenTool,
  Crop,
  EyeOff,
  Sliders,
  Wrench,
  FileCode,
  ScanText,
  FileText,
  SplitSquareVertical,
  Search,
  Sparkles,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
  HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TOOLS, CATEGORIES } from '../config/tools';
import { useLanguage } from '../contexts/LanguageContext';
import type { ToolCategory, JobRecord } from '../types';

export const Home: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentJobs, setRecentJobs] = useState<JobRecord[]>([]);
  const [platformStats, setPlatformStats] = useState({
    total_jobs: 148293,
    total_pages: 582490,
    total_savings_mb: 28420.5,
  });

  // Fetch real statistics & recent public activity from API
  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data) setPlatformStats(data);
      })
      .catch((err) => console.warn('Stats fetch note:', err));

    fetch('/api/jobs?limit=4')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRecentJobs(data);
      })
      .catch((err) => console.warn('Recent jobs note:', err));
  }, []);

  const filteredTools = TOOLS.filter((tool) => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getToolIcon = (iconName: string) => {
    const iconProps = { className: "w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-2", strokeWidth: 2.2 };
    switch (iconName) {
      case 'Layers': return <Layers {...iconProps} />;
      case 'Scissors': return <Scissors {...iconProps} />;
      case 'Minimize2': return <Minimize2 {...iconProps} />;
      case 'FileImage': return <FileImage {...iconProps} />;
      case 'Image': return <ImageIcon {...iconProps} />;
      case 'LayoutGrid': return <LayoutGrid {...iconProps} />;
      case 'RotateCw': return <RotateCw {...iconProps} />;
      case 'Stamp': return <Stamp {...iconProps} />;
      case 'ListOrdered': return <ListOrdered {...iconProps} />;
      case 'FileSignature': return <FileSignature {...iconProps} />;
      case 'Type': return <Type {...iconProps} />;
      case 'Lock': return <Lock {...iconProps} />;
      case 'Unlock': return <Unlock {...iconProps} />;
      case 'PenTool': return <PenTool {...iconProps} />;
      case 'Crop': return <Crop {...iconProps} />;
      case 'EyeOff': return <EyeOff {...iconProps} />;
      case 'Sliders': return <Sliders {...iconProps} />;
      case 'Wrench': return <Wrench {...iconProps} />;
      case 'FileCode': return <FileCode {...iconProps} />;
      case 'ScanText': return <ScanText {...iconProps} />;
      case 'FileText': return <FileText {...iconProps} />;
      case 'SplitSquareVertical': return <SplitSquareVertical {...iconProps} />;
      default: return <FileText {...iconProps} />;
    }
  };

  const topFastTools = [
    { name: 'Merge PDF', path: '/merge-pdf', icon: <Layers className="w-4 h-4 text-rose-600" />, color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { name: 'Compress PDF', path: '/compress-pdf', icon: <Minimize2 className="w-4 h-4 text-emerald-600" />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Split PDF', path: '/split-pdf', icon: <Scissors className="w-4 h-4 text-rose-600" />, color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { name: 'Sign PDF', path: '/sign-pdf', icon: <FileSignature className="w-4 h-4 text-purple-600" />, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { name: 'JPG to PDF', path: '/jpg-to-pdf', icon: <ImageIcon className="w-4 h-4 text-blue-600" />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  ];

  return (
    <div className="space-y-10 sm:space-y-14 pb-16">
      {/* Hero Section */}
      <section className="pt-8 sm:pt-12 md:pt-16 pb-4 sm:pb-6 px-4 text-center max-w-4xl mx-auto space-y-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
          <span>The Web's Most Loved PDF Suite — 100% Free & Client-Side</span>
        </motion.div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
          {t('hero.title')}
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {t('hero.subtitle')}
        </p>

        {/* Live Search Bar */}
        <div className="max-w-xl mx-auto relative pt-2">
          <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border border-slate-200 bg-white">
            <Search className="w-5 h-5 text-slate-400 absolute left-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('hero.search_placeholder')}
              className="w-full pl-12 pr-4 py-3.5 sm:py-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none min-h-[48px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="pr-4 text-xs font-bold text-slate-400 hover:text-slate-600 min-h-[44px] flex items-center"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Mobile Fast Action Quick Pills */}
        <div className="pt-1 flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {topFastTools.map((t) => (
            <Link
              key={t.path}
              to={t.path}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 whitespace-nowrap min-h-[36px] active:scale-95 transition-transform ${t.color}`}
            >
              {t.icon}
              <span>{t.name}</span>
            </Link>
          ))}
        </div>

        {/* Client-side privacy guarantee pill */}
        <div className="pt-1 text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{t('hero.privacy_note')}</span>
        </div>
      </section>

      {/* Category Filter Tabs with Apple Sliding Pill */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start md:justify-center gap-1.5 p-1.5 bg-slate-100/80 rounded-3xl overflow-x-auto scrollbar-none border border-slate-200/70 max-w-fit md:mx-auto">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearchQuery('');
                }}
                className={`relative px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-colors cursor-pointer min-h-[40px] touch-manipulation z-10 ${
                  isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="categoryIndicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-slate-900 rounded-2xl shadow-sm -z-10"
                  />
                )}
                {t(cat.labelKey)}
              </button>
            );
          })}
        </div>
      </section>

      {/* 22 Tool Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          <AnimatePresence>
            {filteredTools.map((tool) => (
              <motion.div
                layout
                key={tool.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              >
                <Link
                  to={tool.route}
                  className={`group bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 active:scale-[0.98] transition-all flex flex-col justify-between relative overflow-hidden h-full min-h-[224px] touch-manipulation ${tool.accentBorder}`}
                >
                  {/* Subtle Card Ambient Glow on Hover */}
                  <div
                    className="absolute -right-12 -top-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-15 blur-2xl transition-opacity pointer-events-none"
                    style={{ backgroundColor: tool.color }}
                  />

                  {/* Top Accent & Icon Squircle */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md apple-icon-container overflow-hidden ${tool.bgLight}`}
                      style={{ color: tool.color }}
                    >
                      {/* Glass specular top highlight */}
                      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                      {getToolIcon(tool.iconName)}
                    </div>

                    {tool.popular && (
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-900 border border-amber-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                        Popular
                      </span>
                    )}
                  </div>

                  {/* Title & Description with SF Pro Typography */}
                  <div className="space-y-1.5 mb-4 flex-1">
                    <h3 className="font-black text-base sm:text-lg text-slate-900 group-hover:text-rose-600 transition-colors tracking-tight">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {tool.shortDesc}
                    </p>
                  </div>

                  {/* Bottom Meta Pill & Action Indicator */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-400 group-hover:text-slate-900 transition-colors">
                    <span className="bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 text-slate-500 font-mono text-[10px]">
                      {tool.acceptedFormats[0]} → {tool.outputFormat.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all">
                      <span className="text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Open</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Recent Processing Live Stream Ribbon */}
      {recentJobs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>Live Processing Telemetry</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black">Trusted by over 140,000+ daily documents</h3>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 justify-center">
              {recentJobs.slice(0, 3).map((job) => (
                <div key={job.id} className="bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold">{job.tool.toUpperCase()}</span>
                  <span className="text-slate-400">({(job.output_bytes / 1024).toFixed(0)} KB)</span>
                </div>
              ))}

              <Link
                to="/history"
                className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors min-h-[40px] flex items-center"
              >
                View History & Stats →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Benefits Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Engineered for Extreme Speed & Security</h2>
          <p className="text-xs sm:text-sm text-slate-500">Fast, local, high precision, and designed for mobile and desktop alike.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base sm:text-lg text-slate-900">100% Client-Side Privacy</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your sensitive legal, financial, and personal PDFs never get sent across the internet unless you choose cloud sharing.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base sm:text-lg text-slate-900">Zero Upload Delays</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Experience instant split-second rendering, compression, and merging directly in device memory without remote network lag.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base sm:text-lg text-slate-900">Fluid Multi-Tool Workflows</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Merge files, reorder pages, compress, watermark, and sign in one fluid pipeline without re-uploading the same file.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-5">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500">Everything you need to know about our browser PDF platform.</p>
        </div>

        <div className="space-y-3">
          <details className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs group">
            <summary className="font-bold text-sm text-slate-900 cursor-pointer list-none flex items-center justify-between">
              <span>Is this PDF suite free to use?</span>
              <span className="text-rose-600 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
              Yes, all standard PDF tools (Merge, Split, Compress, Rotate, Watermark, eSign, Organize, Convert) are 100% free with unlimited tasks.
            </p>
          </details>

          <details className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs group">
            <summary className="font-bold text-sm text-slate-900 cursor-pointer list-none flex items-center justify-between">
              <span>Are my documents secure and private?</span>
              <span className="text-rose-600 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
              Yes! All PDF manipulations happen directly within your web browser using client-side WebAssembly and JavaScript engines. No files are retained on our servers.
            </p>
          </details>

          <details className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs group">
            <summary className="font-bold text-sm text-slate-900 cursor-pointer list-none flex items-center justify-between">
              <span>Can I use this on mobile devices?</span>
              <span className="text-rose-600 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
              Absolutely. Our interface is fully responsive on iPhone, iPad, Android phones, and tablets with seamless touch controls, multi-file drag-and-drop, and bottom quick navigation.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
};

export default Home;
