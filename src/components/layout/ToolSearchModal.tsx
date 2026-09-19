import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { TOOLS } from '../../config/tools';

interface ToolSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ToolSearchModal: React.FC<ToolSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : {};
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTools = TOOLS.filter(
    (tool) =>
      tool.name.toLowerCase().includes(query.toLowerCase()) ||
      tool.shortDesc.toLowerCase().includes(query.toLowerCase()) ||
      tool.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (route: string) => {
    navigate(route);
    onClose();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Search Input */}
        <div className="relative flex items-center px-4 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any PDF tool (e.g. merge, compress, watermark, sign)..."
            className="w-full py-4 px-3 text-base text-gray-800 placeholder-gray-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {filteredTools.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No tools matching "<strong>{query}</strong>"
            </div>
          ) : (
            filteredTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleSelect(tool.route)}
                className="w-full text-left p-3 rounded-xl flex items-center justify-between hover:bg-red-50/70 group transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${tool.bgLight}`}
                  >
                    {tool.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900 group-hover:text-[#e5322d] transition-colors flex items-center gap-2">
                      <span>{tool.name}</span>
                      {tool.popular && (
                        <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.2 rounded font-bold">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-1">{tool.shortDesc}</div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#e5322d] group-hover:translate-x-1 transition-all" />
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#e5322d]" /> 22 High-Precision PDF Tools Available
          </span>
          <span className="text-[11px] font-mono">ESC to close</span>
        </div>
      </div>
    </div>
  );
};

export default ToolSearchModal;
