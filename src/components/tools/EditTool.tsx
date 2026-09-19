import React, { useState, useRef, useEffect } from 'react';
import { PenTool, Type, Square, Highlighter, Eraser, RotateCcw, Save } from 'lucide-react';
import Dropzone from '../common/Dropzone';
import ResultScreen from '../common/ResultScreen';
import { editPdf } from '../../lib/pdfEngine';
import { renderPdfThumbnails } from '../../lib/pdfRenderer';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import type { EditAnnotation, PageThumbnail } from '../../types';

export const EditTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [selectedPage, setSelectedPage] = useState(1);
  const [activeTool, setActiveTool] = useState<'pen' | 'text' | 'rect' | 'highlight' | 'eraser'>('pen');
  const [currentColor, setCurrentColor] = useState('#e5322d');
  const [annotations, setAnnotations] = useState<EditAnnotation[]>([]);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
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
      const thumbs = await renderPdfThumbnails(buf, 10);
      setThumbnails(thumbs);
      setSelectedPage(1);
    } catch (e) {
      console.warn('Thumbnail error:', e);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    if (activeTool === 'text') {
      const textPrompt = prompt('Enter text note:', 'Important Note');
      if (textPrompt) {
        setAnnotations([
          ...annotations,
          {
            id: Math.random().toString(36).substring(2, 8),
            type: 'text',
            pageNumber: selectedPage,
            x: xPct,
            y: yPct,
            width: 30,
            height: 8,
            text: textPrompt,
            fontSize: 14,
            color: currentColor,
          },
        ]);
      }
    } else if (activeTool === 'rect') {
      setAnnotations([
        ...annotations,
        {
          id: Math.random().toString(36).substring(2, 8),
          type: 'rectangle',
          pageNumber: selectedPage,
          x: Math.max(0, xPct - 10),
          y: Math.max(0, yPct - 6),
          width: 20,
          height: 12,
          color: currentColor,
          strokeWidth: 2,
        },
      ]);
    } else if (activeTool === 'highlight') {
      setAnnotations([
        ...annotations,
        {
          id: Math.random().toString(36).substring(2, 8),
          type: 'highlight',
          pageNumber: selectedPage,
          x: Math.max(0, xPct - 15),
          y: Math.max(0, yPct - 3),
          width: 30,
          height: 6,
          color: '#fef08a',
        },
      ]);
    }
  };

  const handleSave = async () => {
    if (!file) return;

    setLoading(true);
    const startTime = Date.now();
    try {
      const { blob, pageCount } = await editPdf(file, annotations);
      const outputName = `${file.name.replace(/\.pdf$/i, '')}_edited.pdf`;

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
          tool: 'edit-pdf',
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

      showToast('Edited PDF saved with all annotations!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error saving edited PDF', 'error');
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
        fromTool="edit-pdf"
      />
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelect}
          title="Select PDF file to Edit"
          subtitle="Add text boxes, highlight text, draw shapes, and annotate pages"
        />
      ) : (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Toolbar */}
          <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTool('text')}
                className={`p-2.5 rounded-2xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTool === 'text' ? 'bg-[#e5322d] text-white shadow-xs' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Type className="w-4 h-4" /> Add Text
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('highlight')}
                className={`p-2.5 rounded-2xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTool === 'highlight' ? 'bg-[#e5322d] text-white shadow-xs' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Highlighter className="w-4 h-4" /> Highlight
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('rect')}
                className={`p-2.5 rounded-2xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTool === 'rect' ? 'bg-[#e5322d] text-white shadow-xs' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Square className="w-4 h-4" /> Rectangle
              </button>

              <button
                type="button"
                onClick={() => setAnnotations([])}
                className="p-2.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-2xl text-xs font-semibold text-gray-600 flex items-center gap-1.5 cursor-pointer ml-2"
              >
                <RotateCcw className="w-4 h-4" /> Clear All
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {['#e5322d', '#10b981', '#3b82f6', '#0f172a'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrentColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full ${currentColor === c ? 'ring-2 ring-gray-400 scale-110' : ''}`}
                  />
                ))}
              </div>

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

              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-5 py-2.5 bg-[#e5322d] hover:bg-red-700 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save PDF</span>
              </button>
            </div>
          </div>

          {/* Interactive Page Canvas */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex justify-center">
            <div
              onClick={handleCanvasClick}
              className="relative w-full max-w-xl aspect-[1/1.414] bg-white border border-gray-300 rounded-2xl shadow-lg overflow-hidden cursor-crosshair select-none"
            >
              {thumbnails[selectedPage - 1]?.dataUrl ? (
                <img
                  src={thumbnails[selectedPage - 1].dataUrl}
                  alt="Page"
                  className="w-full h-full object-contain pointer-events-none"
                />
              ) : (
                <div className="p-8 text-xs text-gray-400">Loading Page...</div>
              )}

              {/* Render dynamic annotations */}
              {annotations
                .filter((a) => a.pageNumber === selectedPage)
                .map((ann) => {
                  if (ann.type === 'text') {
                    return (
                      <div
                        key={ann.id}
                        style={{
                          position: 'absolute',
                          left: `${ann.x}%`,
                          top: `${ann.y}%`,
                          color: ann.color,
                          fontSize: `${ann.fontSize}px`,
                          fontWeight: 'bold',
                        }}
                        className="bg-white/80 px-1.5 py-0.5 rounded border border-gray-200 shadow-2xs"
                      >
                        {ann.text}
                      </div>
                    );
                  }
                  if (ann.type === 'rectangle') {
                    return (
                      <div
                        key={ann.id}
                        style={{
                          position: 'absolute',
                          left: `${ann.x}%`,
                          top: `${ann.y}%`,
                          width: `${ann.width}%`,
                          height: `${ann.height}%`,
                          borderColor: ann.color,
                          borderWidth: '2px',
                        }}
                        className="border-solid rounded-sm pointer-events-none"
                      />
                    );
                  }
                  if (ann.type === 'highlight') {
                    return (
                      <div
                        key={ann.id}
                        style={{
                          position: 'absolute',
                          left: `${ann.x}%`,
                          top: `${ann.y}%`,
                          width: `${ann.width}%`,
                          height: `${ann.height}%`,
                          backgroundColor: 'rgba(254, 240, 138, 0.5)',
                        }}
                        className="pointer-events-none"
                      />
                    );
                  }
                  return null;
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditTool;
