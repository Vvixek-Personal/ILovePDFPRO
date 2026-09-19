import React, { useState, useCallback } from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus, Layers, Sparkles, UploadCloud, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../common/Dropzone';
import ResultScreen from '../common/ResultScreen';
import { mergePdfFiles } from '../../lib/pdfEngine';
import { renderPdfThumbnails } from '../../lib/pdfRenderer';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { generateSamplePdf } from '../../lib/samplePdf';

export const MergeTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnails, setThumbnails] = useState<{ [fileName: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; fileName: string; pageCount: number } | null>(null);
  const [isWorkspaceDragging, setIsWorkspaceDragging] = useState(false);

  const { showToast } = useToast();
  const { user } = useAuth();

  const handleAddFiles = useCallback(async (newFiles: File[]) => {
    const pdfOnly = newFiles.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (pdfOnly.length === 0) {
      showToast('Please select valid PDF documents.', 'warning');
      return;
    }

    setFiles((prev) => [...prev, ...pdfOnly]);
    showToast(`Added ${pdfOnly.length} PDF${pdfOnly.length > 1 ? 's' : ''}`, 'info');

    // Render quick thumbnail preview for each new file
    for (const file of pdfOnly) {
      try {
        const buf = await file.arrayBuffer();
        const thumbs = await renderPdfThumbnails(buf, 1, 0.3);
        if (thumbs[0]?.dataUrl) {
          setThumbnails((prev) => ({ ...prev, [file.name]: thumbs[0].dataUrl! }));
        }
      } catch (e) {
        console.warn('Thumbnail preview error', e);
      }
    }
  }, [showToast]);

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;
    const updated = [...files];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFiles(updated);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSample = async () => {
    const sample1 = await generateSamplePdf('Sample_Doc_A.pdf', 2);
    const sample2 = await generateSamplePdf('Sample_Doc_B.pdf', 2);
    handleAddFiles([sample1, sample2]);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      showToast('Please add at least 2 PDF files to merge.', 'warning');
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    try {
      const { blob, pageCount } = await mergePdfFiles(files);
      const outputName = `Merged_Document_${files.length}_files.pdf`;

      setResult({
        blob,
        fileName: outputName,
        pageCount,
      });

      // Log to database API
      fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || null,
          tool: 'merge',
          execution_mode: 'client',
          status: 'succeeded',
          input_count: files.length,
          input_bytes: files.reduce((acc, f) => acc + f.size, 0),
          output_bytes: blob.size,
          page_count: pageCount,
          duration_ms: Date.now() - startTime,
          savings_bytes: 0,
          file_name: outputName,
        }),
      }).catch(console.error);

      showToast(`Merged ${files.length} PDFs into ${pageCount} pages!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error merging PDFs', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handling over the active list
  const handleWorkspaceDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isWorkspaceDragging) setIsWorkspaceDragging(true);
  };

  const handleWorkspaceDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsWorkspaceDragging(false);
  };

  const handleWorkspaceDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWorkspaceDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  if (result) {
    return (
      <ResultScreen
        blob={result.blob}
        fileName={result.fileName}
        pageCount={result.pageCount}
        fromTool="merge-pdf"
      />
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-6 sm:py-8 px-4">
      {files.length === 0 ? (
        <div className="space-y-6">
          <Dropzone
            onFilesSelected={handleAddFiles}
            multiple={true}
            title="Select PDF files to Merge"
            subtitle="Drag & drop multiple PDF documents, or tap to choose files from device"
          />
        </div>
      ) : (
        <div
          onDragOver={handleWorkspaceDragOver}
          onDragLeave={handleWorkspaceDragLeave}
          onDrop={handleWorkspaceDrop}
          className="space-y-6 relative"
        >
          {/* Visual Workspace Drag-over Overlay */}
          <AnimatePresence>
            {isWorkspaceDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 bg-rose-500/10 border-2 border-dashed border-rose-500 rounded-3xl backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center pointer-events-none"
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-rose-600 mb-3">
                  <UploadCloud className="w-8 h-8 animate-bounce" />
                </div>
                <div className="text-lg font-black text-slate-900">Drop more PDFs here</div>
                <div className="text-xs text-slate-600">Files will be appended to the merge queue</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">
                {files.length} {files.length === 1 ? 'file' : 'files'} selected
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({(files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB total)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 min-h-[44px] active:scale-95 touch-manipulation">
                <Plus className="w-4 h-4 text-rose-600" />
                <span>Add More PDFs</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={(e) => e.target.files && handleAddFiles(Array.from(e.target.files))}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleAddSample}
                className="px-4 py-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold hover:bg-amber-100 cursor-pointer flex items-center gap-1.5 min-h-[44px] active:scale-95 touch-manipulation"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Add Sample</span>
              </button>
            </div>
          </div>

          {/* Reordering Instructions Banner for Mobile & Desktop */}
          <div className="text-xs text-slate-500 px-2 flex items-center justify-between">
            <span>Use the arrows to organize page order before merging:</span>
            <span className="font-semibold text-rose-600">Top file = Page 1</span>
          </div>

          {/* Files List with Fluid Motion Reorder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <AnimatePresence>
              {files.map((file, idx) => (
                <motion.div
                  layout
                  key={`${file.name}_${idx}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-20 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 flex items-center justify-center">
                      {thumbnails[file.name] ? (
                        <img src={thumbnails[file.name]} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-slate-400">PDF</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                      <div className="text-[10px] bg-rose-50 text-rose-600 font-extrabold px-2 py-0.5 rounded-md inline-block mt-2">
                        Part #{idx + 1}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Touch targets min 44px) */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveFile(idx, 'up')}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl disabled:opacity-20 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation active:scale-95"
                        title="Move Up"
                        aria-label="Move file up in sequence"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === files.length - 1}
                        onClick={() => moveFile(idx, 'down')}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl disabled:opacity-20 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation active:scale-95"
                        title="Move Down"
                        aria-label="Move file down in sequence"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation active:scale-95"
                      title="Remove file"
                      aria-label="Remove file from merge"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Merge Big CTA Button */}
          <div className="flex justify-center pt-4 pb-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMerge}
              disabled={loading || files.length < 2}
              className="w-full sm:w-auto px-10 py-4 sm:py-5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-40 min-h-[52px] touch-manipulation"
            >
              <Layers className="w-6 h-6 flex-shrink-0" />
              <span>{loading ? 'Merging PDFs in RAM...' : `Merge ${files.length} PDFs ->`}</span>
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MergeTool;
