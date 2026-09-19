import React, { useState } from 'react';
import { Type, Plus, Trash2 } from 'lucide-react';
import Dropzone from '../common/Dropzone';
import ResultScreen from '../common/ResultScreen';
import { addTextToPdf } from '../../lib/pdfEngine';
import { renderPdfThumbnails } from '../../lib/pdfRenderer';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import type { PageThumbnail } from '../../types';

interface TextAnnotation {
  id: string;
  text: string;
  pageNumber: number;
  x: number; // percentage
  y: number; // percentage
  fontSize: number;
  color: string;
}

export const AddTextTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [selectedPage, setSelectedPage] = useState(1);
  const [annotations, setAnnotations] = useState<TextAnnotation[]>([
    {
      id: '1',
      text: 'Approved on ' + new Date().toLocaleDateString(),
      pageNumber: 1,
      x: 10,
      y: 12,
      fontSize: 14,
      color: '#e5322d',
    },
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
      const thumbs = await renderPdfThumbnails(buf, 10);
      setThumbnails(thumbs);
      setSelectedPage(1);
    } catch (e) {
      console.warn('Thumbnail error:', e);
    }
  };

  const handleAddAnnotation = () => {
    setAnnotations([
      ...annotations,
      {
        id: Math.random().toString(36).substring(2, 9),
        text: 'New text note',
        pageNumber: selectedPage,
        x: 20,
        y: 20 + annotations.length * 5,
        fontSize: 14,
        color: '#0f172a',
      },
    ]);
  };

  const updateAnnotation = (id: string, updates: Partial<TextAnnotation>) => {
    setAnnotations(annotations.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(annotations.filter((a) => a.id !== id));
  };

  const handleApply = async () => {
    if (!file) return;

    setLoading(true);
    const startTime = Date.now();
    try {
      const { blob, pageCount } = await addTextToPdf(file, annotations);
      const outputName = `${file.name.replace(/\.pdf$/i, '')}_annotated.pdf`;

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
          tool: 'add-text',
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

      showToast('Text notes added to PDF!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error adding text', 'error');
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
        fromTool="add-text"
      />
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelect}
          title="Select PDF to Add Text & Notes"
          subtitle="Add custom text labels, approval notes, headers, and dates onto any page"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
          {/* Document Preview (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{file.name}</h3>
                  <p className="text-xs text-gray-500">Page {selectedPage} Preview</p>
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
              </div>

              <div className="mt-6 flex justify-center">
                <div className="relative w-full max-w-md aspect-[1/1.414] bg-white border border-gray-300 rounded-xl shadow-md overflow-hidden select-none">
                  {thumbnails[selectedPage - 1]?.dataUrl && (
                    <img
                      src={thumbnails[selectedPage - 1].dataUrl}
                      alt="Page"
                      className="w-full h-full object-contain"
                    />
                  )}

                  {/* Render positioned text notes */}
                  {annotations
                    .filter((a) => a.pageNumber === selectedPage)
                    .map((ann) => (
                      <div
                        key={ann.id}
                        style={{
                          position: 'absolute',
                          left: `${ann.x}%`,
                          top: `${ann.y}%`,
                          color: ann.color,
                          fontSize: `${ann.fontSize * 0.9}px`,
                          fontWeight: 'bold',
                        }}
                        className="bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded border border-gray-300 shadow-xs cursor-move"
                      >
                        {ann.text}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Text Controls Sidebar (Col 5) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-base">Text Annotations</h3>
                <button
                  type="button"
                  onClick={handleAddAnnotation}
                  className="px-3 py-1.5 bg-red-50 text-[#e5322d] hover:bg-red-100 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Note
                </button>
              </div>

              {/* Annotations List */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {annotations.map((ann, i) => (
                  <div key={ann.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">Note #{i + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeAnnotation(ann.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={ann.text}
                      onChange={(e) => updateAnnotation(ann.id, { text: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Page</label>
                        <select
                          value={ann.pageNumber}
                          onChange={(e) => updateAnnotation(ann.id, { pageNumber: parseInt(e.target.value, 10) })}
                          className="w-full mt-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs"
                        >
                          {thumbnails.map((t) => (
                            <option key={t.pageNumber} value={t.pageNumber}>
                              P. {t.pageNumber}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Size</label>
                        <input
                          type="number"
                          min="8"
                          max="48"
                          value={ann.fontSize}
                          onChange={(e) => updateAnnotation(ann.id, { fontSize: parseInt(e.target.value, 10) || 12 })}
                          className="w-full mt-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Color</label>
                        <input
                          type="color"
                          value={ann.color}
                          onChange={(e) => updateAnnotation(ann.id, { color: e.target.value })}
                          className="w-full mt-1 h-7 rounded-lg border-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleApply}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#e5322d] hover:bg-red-700 text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Type className="w-5 h-5" />
                <span>{loading ? 'Embedding Text...' : 'Save PDF with Text ->'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTextTool;
