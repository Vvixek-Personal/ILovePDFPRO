import React, { useState } from 'react';
import { Scissors, FileText, CheckCircle2 } from 'lucide-react';
import Dropzone from '../common/Dropzone';
import ResultScreen from '../common/ResultScreen';
import ThumbnailGrid from '../common/ThumbnailGrid';
import { splitPdf } from '../../lib/pdfEngine';
import { renderPdfThumbnails } from '../../lib/pdfRenderer';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import type { PageThumbnail } from '../../types';

export const SplitTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [mode, setMode] = useState<'ranges' | 'all-pages' | 'extract-selected'>('ranges');
  const [rangeStr, setRangeStr] = useState('1-3');
  const [selectedPages, setSelectedPages] = useState<number[]>([1]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; fileName: string; isZip: boolean; pageCount: number } | null>(null);

  const { showToast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = async (files: File[]) => {
    if (!files[0]) return;
    const selected = files[0];
    setFile(selected);

    try {
      const buf = await selected.arrayBuffer();
      const thumbs = await renderPdfThumbnails(buf);
      setThumbnails(thumbs);
      setRangeStr(`1-${Math.min(thumbs.length, 2)}`);
      setSelectedPages([1]);
    } catch (e) {
      console.warn('Thumbnail error:', e);
    }
  };

  const togglePageSelection = (pageNum: number) => {
    if (selectedPages.includes(pageNum)) {
      if (selectedPages.length > 1) {
        setSelectedPages(selectedPages.filter((p) => p !== pageNum));
      }
    } else {
      setSelectedPages([...selectedPages, pageNum].sort((a, b) => a - b));
    }
  };

  const handleSplit = async () => {
    if (!file) return;

    setLoading(true);
    const startTime = Date.now();
    try {
      const { blob, isZip, pageCount, fileName } = await splitPdf(file, {
        mode,
        ranges: rangeStr,
        selectedPages,
      });

      setResult({
        blob,
        fileName,
        isZip,
        pageCount,
      });

      fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || null,
          tool: 'split',
          execution_mode: 'client',
          status: 'succeeded',
          input_count: 1,
          input_bytes: file.size,
          output_bytes: blob.size,
          page_count: pageCount,
          duration_ms: Date.now() - startTime,
          file_name: fileName,
        }),
      }).catch(console.error);

      showToast(isZip ? 'Split all pages into ZIP archive!' : `Extracted ${pageCount} pages!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error splitting PDF', 'error');
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
        isZip={result.isZip}
        fromTool="split-pdf"
      />
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelect}
          title="Select PDF file to Split"
          subtitle="Extract pages, split by ranges, or burst into individual pages"
        />
      ) : (
        <div className="space-y-8 animate-in fade-in">
          {/* Mode Selector */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{file.name}</h3>
                <p className="text-xs text-gray-500">
                  {thumbnails.length} pages • {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-xs font-semibold text-gray-500 hover:text-red-600"
              >
                Choose another file
              </button>
            </div>

            {/* Split Mode Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setMode('ranges')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  mode === 'ranges'
                    ? 'border-[#e5322d] bg-red-50/50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-sm text-gray-900">Custom Ranges</div>
                <div className="text-xs text-gray-500 mt-1">Example: 1-3, 5, 8-10</div>
              </button>

              <button
                type="button"
                onClick={() => setMode('extract-selected')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  mode === 'extract-selected'
                    ? 'border-[#e5322d] bg-red-50/50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-sm text-gray-900">Extract Selected Pages</div>
                <div className="text-xs text-gray-500 mt-1">Click thumbnails below to choose</div>
              </button>

              <button
                type="button"
                onClick={() => setMode('all-pages')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  mode === 'all-pages'
                    ? 'border-[#e5322d] bg-red-50/50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-sm text-gray-900">Extract All Pages (ZIP)</div>
                <div className="text-xs text-gray-500 mt-1">Every page into a single PDF</div>
              </button>
            </div>

            {/* Range Input if mode is ranges */}
            {mode === 'ranges' && (
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                <label className="block text-xs font-bold text-gray-700">Enter Page Ranges to Extract</label>
                <input
                  type="text"
                  value={rangeStr}
                  onChange={(e) => setRangeStr(e.target.value)}
                  placeholder="e.g. 1-3, 5"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-mono focus:border-[#e5322d] focus:outline-none"
                />
                <p className="text-[11px] text-gray-500">
                  Total document pages: 1 to {thumbnails.length}
                </p>
              </div>
            )}
          </div>

          {/* Interactive Thumbnails for selection */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {mode === 'extract-selected' ? 'Click pages to include/exclude:' : 'Document Page Previews:'}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {thumbnails.map((thumb) => {
                const isSelected = selectedPages.includes(thumb.pageNumber);

                return (
                  <div
                    key={thumb.pageNumber}
                    onClick={() => mode === 'extract-selected' && togglePageSelection(thumb.pageNumber)}
                    className={`relative bg-gray-50 rounded-2xl p-2 border-2 transition-all cursor-pointer ${
                      mode === 'extract-selected' && isSelected
                        ? 'border-[#e5322d] ring-2 ring-red-100 bg-red-50/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full aspect-[1/1.414] bg-white rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                      {thumb.dataUrl && (
                        <img src={thumb.dataUrl} alt={`Page ${thumb.pageNumber}`} className="w-full h-full object-contain" />
                      )}
                    </div>

                    <div className="mt-2 text-center text-xs font-bold text-gray-700">
                      Page {thumb.pageNumber}
                    </div>

                    {mode === 'extract-selected' && isSelected && (
                      <div className="absolute top-2 right-2 bg-[#e5322d] text-white rounded-full p-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleSplit}
              disabled={loading}
              className="px-10 py-5 rounded-2xl bg-[#e5322d] hover:bg-red-700 text-white font-extrabold text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
            >
              <Scissors className="w-6 h-6" />
              <span>{loading ? 'Splitting PDF...' : 'Split PDF ->'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SplitTool;
