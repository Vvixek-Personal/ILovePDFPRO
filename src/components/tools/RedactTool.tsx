import React, { useState } from 'react';
import { EyeOff, ShieldAlert, Plus, Trash2 } from 'lucide-react';
import Dropzone from '../common/Dropzone';
import ResultScreen from '../common/ResultScreen';
import { redactPdf } from '../../lib/pdfEngine';
import { renderPdfThumbnails } from '../../lib/pdfRenderer';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import type { PageThumbnail } from '../../types';

export const RedactTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [selectedPage, setSelectedPage] = useState(1);
  const [redactions, setRedactions] = useState<{ id: string; pageNumber: number; x: number; y: number; width: number; height: number }[]>([
    { id: '1', pageNumber: 1, x: 20, y: 35, width: 45, height: 6 },
  ]);

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
      const thumbs = await renderPdfThumbnails(buf, 8);
      setThumbnails(thumbs);
      setSelectedPage(1);
    } catch (e) {
      console.warn('Thumbnail error:', e);
    }
  };

  const handleAddRedaction = () => {
    setRedactions([
      ...redactions,
      {
        id: Math.random().toString(36).substring(2, 8),
        pageNumber: selectedPage,
        x: 20,
        y: 20 + redactions.length * 8,
        width: 50,
        height: 5,
      },
    ]);
  };

  const handleApplyRedaction = async () => {
    if (!file || redactions.length === 0) return;

    setLoading(true);
    const startTime = Date.now();
    try {
      const { blob, pageCount } = await redactPdf(file, redactions);
      const outputName = `${file.name.replace(/\.pdf$/i, '')}_sanitized.pdf`;

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
          tool: 'redact-pdf',
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

      showToast('Document permanently sanitized and redacted!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error redacting PDF', 'error');
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
        fromTool="redact-pdf"
      />
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelect}
          title="Select PDF for Permanent Redaction"
          subtitle="Black-out and sanitize sensitive text, SSNs, credit cards, and confidential details"
        />
      ) : (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{file.name}</h3>
              <p className="text-xs text-gray-500">
                {redactions.length} black-out zones marked on Page {selectedPage}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddRedaction}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Blackout Box
              </button>

              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
              >
                {thumbnails.map((t) => (
                  <option key={t.pageNumber} value={t.pageNumber}>
                    Page {t.pageNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Document Sheet */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex justify-center">
            <div className="relative w-full max-w-md aspect-[1/1.414] bg-white border border-gray-300 rounded-xl shadow-md overflow-hidden select-none">
              {thumbnails[selectedPage - 1]?.dataUrl ? (
                <img src={thumbnails[selectedPage - 1].dataUrl} alt="Page" className="w-full h-full object-contain" />
              ) : (
                <div className="p-8 text-xs text-gray-400">Loading Page...</div>
              )}

              {/* Render black-out boxes */}
              {redactions
                .filter((r) => r.pageNumber === selectedPage)
                .map((r) => (
                  <div
                    key={r.id}
                    style={{
                      position: 'absolute',
                      left: `${r.x}%`,
                      top: `${r.y}%`,
                      width: `${r.width}%`,
                      height: `${r.height}%`,
                    }}
                    className="bg-black text-white flex items-center justify-between px-2 text-[10px] font-mono group"
                  >
                    <span>[REDACTED]</span>
                    <button
                      onClick={() => setRedactions(redactions.filter((x) => x.id !== r.id))}
                      className="text-red-400 hover:text-white font-bold opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={handleApplyRedaction}
              disabled={loading}
              className="px-10 py-5 rounded-2xl bg-[#dc2626] hover:bg-red-700 text-white font-extrabold text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
            >
              <EyeOff className="w-6 h-6" />
              <span>{loading ? 'Sanitizing...' : 'Apply Permanent Redaction ->'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedactTool;
