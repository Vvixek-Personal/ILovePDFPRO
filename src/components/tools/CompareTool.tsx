import React, { useState } from 'react';
import { SplitSquareVertical, ArrowLeftRight } from 'lucide-react';
import { renderPdfThumbnails } from '../../lib/pdfRenderer';
import { useToast } from '../../contexts/ToastContext';
import { generateSamplePdf } from '../../lib/samplePdf';
import type { PageThumbnail } from '../../types';

export const CompareTool: React.FC = () => {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [thumbsA, setThumbsA] = useState<PageThumbnail[]>([]);
  const [thumbsB, setThumbsB] = useState<PageThumbnail[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToast();

  const handleSelectA = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFileA(f);
      const buf = await f.arrayBuffer();
      const thumbs = await renderPdfThumbnails(buf, 10);
      setThumbsA(thumbs);
    }
  };

  const handleSelectB = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFileB(f);
      const buf = await f.arrayBuffer();
      const thumbs = await renderPdfThumbnails(buf, 10);
      setThumbsB(thumbs);
    }
  };

  const handleLoadDemo = async () => {
    const s1 = await generateSamplePdf('Original_Proposal_v1.pdf', 3);
    const s2 = await generateSamplePdf('Revised_Proposal_v2.pdf', 3);
    setFileA(s1);
    setFileB(s2);

    const b1 = await s1.arrayBuffer();
    const b2 = await s2.arrayBuffer();
    setThumbsA(await renderPdfThumbnails(b1, 3));
    setThumbsB(await renderPdfThumbnails(b2, 3));
    showToast('Loaded 2 comparison sample documents!', 'info');
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-gray-900 text-lg">Compare PDF Documents</h3>
          <p className="text-xs text-gray-500">Side-by-side synchronized visual comparison</p>
        </div>

        <button
          type="button"
          onClick={handleLoadDemo}
          className="px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 cursor-pointer"
        >
          Load 2 Sample Versions
        </button>
      </div>

      {/* Upload split container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document A */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 uppercase">Version A (Original)</span>
            <label className="text-xs font-bold text-[#e5322d] hover:underline cursor-pointer">
              Choose File
              <input type="file" accept=".pdf" onChange={handleSelectA} className="hidden" />
            </label>
          </div>

          <div className="w-full aspect-[1/1.414] bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center relative">
            {thumbsA[currentPage - 1]?.dataUrl ? (
              <img src={thumbsA[currentPage - 1].dataUrl} alt="Version A" className="w-full h-full object-contain" />
            ) : (
              <div className="text-xs text-gray-400">Select Document A to Preview</div>
            )}
            <div className="absolute top-2 left-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              A: Page {currentPage}
            </div>
          </div>
        </div>

        {/* Document B */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 uppercase">Version B (Modified)</span>
            <label className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">
              Choose File
              <input type="file" accept=".pdf" onChange={handleSelectB} className="hidden" />
            </label>
          </div>

          <div className="w-full aspect-[1/1.414] bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center relative">
            {thumbsB[currentPage - 1]?.dataUrl ? (
              <img src={thumbsB[currentPage - 1].dataUrl} alt="Version B" className="w-full h-full object-contain" />
            ) : (
              <div className="text-xs text-gray-400">Select Document B to Preview</div>
            )}
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              B: Page {currentPage}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareTool;
