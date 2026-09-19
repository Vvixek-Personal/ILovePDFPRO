import React, { useState, useCallback } from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus, Image as ImageIcon, Sparkles, UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../common/Dropzone';
import ResultScreen from '../common/ResultScreen';
import { convertImagesToPdf } from '../../lib/pdfEngine';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

export const JpgToPdfTool: React.FC = () => {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'fit'>('portrait');
  const [margin, setMargin] = useState<'none' | 'small' | 'big'>('small');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; fileName: string; pageCount: number } | null>(null);
  const [isWorkspaceDragging, setIsWorkspaceDragging] = useState(false);

  const { showToast } = useToast();
  const { user } = useAuth();

  const handleAddImages = useCallback((files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith('image/'));
    if (valid.length === 0) {
      showToast('Please select valid image files (JPG, PNG, WebP).', 'warning');
      return;
    }

    const items = valid.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...items]);
    showToast(`Added ${valid.length} image${valid.length > 1 ? 's' : ''}`, 'info');
  }, [showToast]);

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImages(updated);
  };

  const removeImage = (index: number) => {
    const item = images[index];
    if (item?.preview) {
      URL.revokeObjectURL(item.preview);
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (images.length === 0) return;

    setLoading(true);
    const startTime = Date.now();
    try {
      const rawFiles = images.map((img) => img.file);
      const { blob, pageCount } = await convertImagesToPdf(rawFiles, {
        orientation,
        margin,
        pageSize: 'a4',
      });
      const outputName = `Converted_Images_${images.length}_pages.pdf`;

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
          tool: 'jpg-to-pdf',
          execution_mode: 'client',
          status: 'succeeded',
          input_count: rawFiles.length,
          input_bytes: rawFiles.reduce((acc, f) => acc + f.size, 0),
          output_bytes: blob.size,
          page_count: pageCount,
          duration_ms: Date.now() - startTime,
          file_name: outputName,
        }),
      }).catch(console.error);

      showToast(`Converted ${pageCount} images to PDF!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error converting images to PDF', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Workspace drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isWorkspaceDragging) setIsWorkspaceDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsWorkspaceDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWorkspaceDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddImages(Array.from(e.dataTransfer.files));
    }
  };

  if (result) {
    return (
      <ResultScreen
        blob={result.blob}
        fileName={result.fileName}
        pageCount={result.pageCount}
        fromTool="jpg-to-pdf"
      />
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-6 sm:py-8 px-4">
      {images.length === 0 ? (
        <Dropzone
          onFilesSelected={handleAddImages}
          accept="image/png, image/jpeg, image/webp"
          multiple={true}
          isImage={true}
          title="Select JPG / PNG Images"
          subtitle="Drag & drop multiple image files, or tap to choose from gallery"
        />
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="space-y-6 relative"
        >
          {/* Workspace Drag-over Overlay */}
          <AnimatePresence>
            {isWorkspaceDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-3xl backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center pointer-events-none"
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-blue-600 mb-3">
                  <UploadCloud className="w-8 h-8 animate-bounce" />
                </div>
                <div className="text-lg font-black text-slate-900">Drop more images here</div>
                <div className="text-xs text-slate-600">Images will be added to this PDF conversion</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Configuration Banner */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 min-h-[40px]"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                  <option value="fit">Auto / Match Image</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Page Margins</label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(e.target.value as any)}
                  className="mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 min-h-[40px]"
                >
                  <option value="none">No Margin</option>
                  <option value="small">Small Margin</option>
                  <option value="big">Big Margin</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 min-h-[44px] active:scale-95 touch-manipulation">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Add More Images</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  multiple
                  onChange={(e) => e.target.files && handleAddImages(Array.from(e.target.files))}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            <AnimatePresence>
              {images.map((item, idx) => (
                <motion.div
                  layout
                  key={`${item.file.name}_${idx}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div className="w-full aspect-square bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-100">
                    <img src={item.preview} alt="Thumb" className="w-full h-full object-cover" />
                  </div>

                  <div className="mt-2 text-xs font-bold text-slate-900 truncate" title={item.file.name}>
                    {item.file.name}
                  </div>
                  <div className="text-[10px] text-blue-600 font-bold">
                    Page #{idx + 1}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveImage(idx, 'up')}
                        className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-20 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
                        title="Move Earlier"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => moveImage(idx, 'down')}
                        className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-20 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
                        title="Move Later"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Action CTA */}
          <div className="flex justify-center pt-4 pb-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConvert}
              disabled={loading}
              className="w-full sm:w-auto px-10 py-4 sm:py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 cursor-pointer min-h-[52px] touch-manipulation"
            >
              <ImageIcon className="w-6 h-6 flex-shrink-0" />
              <span>{loading ? 'Converting to PDF in RAM...' : `Convert ${images.length} Images to PDF ->`}</span>
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JpgToPdfTool;
