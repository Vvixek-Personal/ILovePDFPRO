import React, { useState } from 'react';
import { LayoutGrid, Plus, RotateCw, Trash2, ArrowLeftRight } from 'lucide-react';
import Dropzone from '../common/Dropzone';
import ResultScreen from '../common/ResultScreen';
import { organizePdf } from '../../lib/pdfEngine';
import { renderPdfThumbnails } from '../../lib/pdfRenderer';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import type { PageThumbnail } from '../../types';

export const OrganizeTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageThumbnail[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; fileName: string; pageCount: number } | null>(null);

  const { showToast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = async (files: File[]) => {
    if (!files[0]) return;
    const selected = files[0];
    setFile(selected);

    try {
      const buf = await selected.arrayBuffer();
      const thumbs = await renderPdfThumbnails(buf);
      setPages(thumbs);
    } catch (e) {
      console.warn('Thumbnail rendering error:', e);
    }
  };

  const handleRotatePage = (index: number) => {
    const updated = [...pages];
    updated[index].rotation = (updated[index].rotation + 90) % 360;
    setPages(updated);
  };

  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) {
      showToast('Document must have at least one page.', 'warning');
      return;
    }
    setPages(pages.filter((_, i) => i !== index));
  };

  const handleAddBlankPage = () => {
    const newPageNum = pages.length + 1;
    setPages([
      ...pages,
      {
        pageNumber: newPageNum,
        originalPageNumber: -1,
        rotation: 0,
        isBlank: true,
      },
    ]);
    showToast('Blank page inserted at the end', 'info');
  };

  const handleSaveOrganized = async () => {
    if (!file || pages.length === 0) return;

    setLoading(true);
    const startTime = Date.now();
    try {
      const items = pages.map((p) => ({
        originalIndex: p.originalPageNumber - 1,
        rotation: p.rotation,
        isBlank: p.isBlank,
      }));

      const { blob, pageCount } = await organizePdf(file, items);
      const outputName = `${file.name.replace(/\.pdf$/i, '')}_organized.pdf`;

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
          tool: 'organize',
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

      showToast(`Organized PDF with ${pageCount} pages saved!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error organizing PDF', 'error');
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
        fromTool="organize-pdf"
      />
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelect}
          title="Select PDF to Organize"
          subtitle="Sort, delete, rotate, and add pages in your document"
        />
      ) : (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Control Bar */}
          <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{file.name}</h3>
              <p className="text-xs text-gray-500">{pages.length} pages in current layout</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddBlankPage}
                className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#e5322d]" /> Insert Blank Page
              </button>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-red-600"
              >
                Change file
              </button>
            </div>
          </div>

          {/* Visual Grid of Pages */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {pages.map((page, index) => (
                <div
                  key={`${page.originalPageNumber}_${index}`}
                  className="group relative bg-gray-50 rounded-2xl p-3 border-2 border-gray-200 hover:border-[#e5322d] transition-all shadow-xs"
                >
                  {/* Page index badge */}
                  <div className="absolute top-2 left-2 z-10 bg-slate-900/80 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                    {index + 1}
                  </div>

                  <div className="w-full aspect-[1/1.414] bg-white rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 relative">
                    {page.isBlank ? (
                      <div className="text-gray-400 text-xs font-semibold text-center p-2">
                        Blank Page
                      </div>
                    ) : page.dataUrl ? (
                      <img
                        src={page.dataUrl}
                        alt={`Page ${index + 1}`}
                        style={{ transform: `rotate(${page.rotation}deg)` }}
                        className="w-full h-full object-contain transition-transform"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">Page {index + 1}</span>
                    )}

                    {/* Quick Buttons Overlay */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRotatePage(index)}
                        className="p-2 bg-white text-gray-800 rounded-full hover:bg-red-50 hover:text-[#e5322d] shadow-md transition-colors cursor-pointer"
                        title="Rotate 90°"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePage(index)}
                        className="p-2 bg-white text-gray-800 rounded-full hover:bg-red-50 hover:text-red-600 shadow-md transition-colors cursor-pointer"
                        title="Delete page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 text-center text-xs font-semibold text-gray-600 truncate">
                    {page.isBlank ? 'Blank' : `Page ${page.originalPageNumber}`}
                    {page.rotation > 0 && <span className="text-[#e5322d] ml-1">({page.rotation}°)</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleSaveOrganized}
              disabled={loading}
              className="px-10 py-5 rounded-2xl bg-[#e5322d] hover:bg-red-700 text-white font-extrabold text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
            >
              <LayoutGrid className="w-6 h-6" />
              <span>{loading ? 'Saving Layout...' : 'Save Organized PDF ->'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizeTool;
