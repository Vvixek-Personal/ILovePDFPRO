import React, { useState } from 'react';
import { Crop, Check } from 'lucide-react';
import Dropzone from '../common/Dropzone';
import ResultScreen from '../common/ResultScreen';
import { cropPdf } from '../../lib/pdfEngine';
import { renderPdfThumbnails } from '../../lib/pdfRenderer';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import type { PageThumbnail } from '../../types';

export const CropTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [cropBox, setCropBox] = useState({
    xPercent: 10,
    yPercent: 10,
    widthPercent: 80,
    heightPercent: 80,
  });

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
      const thumbs = await renderPdfThumbnails(buf, 4);
      setThumbnails(thumbs);
    } catch (e) {
      console.warn('Thumbnail error:', e);
    }
  };

  const handleCrop = async () => {
    if (!file) return;

    setLoading(true);
    const startTime = Date.now();
    try {
      const { blob, pageCount } = await cropPdf(file, cropBox);
      const outputName = `${file.name.replace(/\.pdf$/i, '')}_cropped.pdf`;

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
          tool: 'crop-pdf',
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

      showToast('PDF pages cropped successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error cropping PDF', 'error');
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
        fromTool="crop-pdf"
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelect}
          title="Select PDF file to Crop"
          subtitle="Trim margins and crop specific rectangular areas across all pages"
        />
      ) : (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{file.name}</h3>
              <p className="text-xs text-gray-500">Adjust the crop boundaries below</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCropBox({ xPercent: 5, yPercent: 5, widthPercent: 90, heightPercent: 90 })}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded-xl"
              >
                Trim White Borders (5%)
              </button>
              <button
                type="button"
                onClick={() => setCropBox({ xPercent: 15, yPercent: 15, widthPercent: 70, heightPercent: 70 })}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded-xl"
              >
                Tight Crop (15%)
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex justify-center">
            <div className="relative w-72 aspect-[1/1.414] bg-white border border-gray-300 rounded-xl shadow-md overflow-hidden">
              {thumbnails[0]?.dataUrl && (
                <img src={thumbnails[0].dataUrl} alt="Preview" className="w-full h-full object-contain" />
              )}

              {/* Crop box rectangle overlay */}
              <div
                style={{
                  position: 'absolute',
                  left: `${cropBox.xPercent}%`,
                  top: `${cropBox.yPercent}%`,
                  width: `${cropBox.widthPercent}%`,
                  height: `${cropBox.heightPercent}%`,
                }}
                className="border-2 border-[#e5322d] bg-red-500/10 rounded-sm shadow-2xl"
              >
                <div className="absolute top-1 left-1 bg-[#e5322d] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  Crop Area
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={handleCrop}
              disabled={loading}
              className="px-10 py-5 rounded-2xl bg-[#e5322d] hover:bg-red-700 text-white font-extrabold text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
            >
              <Crop className="w-6 h-6" />
              <span>{loading ? 'Cropping Pages...' : 'Apply Crop & Download ->'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropTool;
