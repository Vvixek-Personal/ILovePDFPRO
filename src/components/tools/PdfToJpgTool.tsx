import React, { useState } from 'react';
import { FileImage, Download, Sparkles } from 'lucide-react';
import Dropzone from '../common/Dropzone';
import ResultScreen from '../common/ResultScreen';
import { convertPdfToImages } from '../../lib/pdfEngine';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

export const PdfToJpgTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [dpi, setDpi] = useState<'150' | '300'>('150');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    zipBlob: Blob;
    images: { pageNum: number; dataUrl: string; name: string }[];
    fileName: string;
  } | null>(null);

  const { showToast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = (files: File[]) => {
    if (files[0]) setFile(files[0]);
  };

  const handleExtractImages = async () => {
    if (!file) return;

    setLoading(true);
    const startTime = Date.now();
    try {
      const { zipBlob, images } = await convertPdfToImages(file, { format, dpi });
      const outputName = `${file.name.replace(/\.pdf$/i, '')}_images.zip`;

      setResult({
        zipBlob,
        images,
        fileName: outputName,
      });

      fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || null,
          tool: 'pdf-to-jpg',
          execution_mode: 'client',
          status: 'succeeded',
          input_count: 1,
          input_bytes: file.size,
          output_bytes: zipBlob.size,
          page_count: images.length,
          duration_ms: Date.now() - startTime,
          file_name: outputName,
        }),
      }).catch(console.error);

      showToast(`Extracted ${images.length} pages as high-res ${format.toUpperCase()} images!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error extracting images', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="w-full max-w-5xl mx-auto py-8 px-4 space-y-8 animate-in fade-in">
        <ResultScreen
          blob={result.zipBlob}
          fileName={result.fileName}
          pageCount={result.images.length}
          isZip={true}
          fromTool="pdf-to-jpg"
        />

        {/* Gallery of individual page images */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-900 text-base">Individual Page Images ({result.images.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {result.images.map((img) => (
              <div key={img.pageNum} className="bg-gray-50 rounded-2xl p-3 border border-gray-200 text-center space-y-2">
                <div className="w-full aspect-[1/1.414] bg-white rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                  <img src={img.dataUrl} alt={img.name} className="w-full h-full object-contain" />
                </div>
                <div className="text-xs font-bold text-gray-700">Page {img.pageNum}</div>
                <a
                  href={img.dataUrl}
                  download={img.name}
                  className="block w-full py-1.5 bg-white hover:bg-red-50 text-[#e5322d] border border-red-200 rounded-xl text-xs font-bold transition-colors"
                >
                  Download {format.toUpperCase()}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelect}
          title="Select PDF to Convert to JPG"
          subtitle="Extract every page into crisp JPG/PNG images and ZIP package"
        />
      ) : (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base">{file.name}</h3>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-xs font-semibold text-gray-500 hover:text-red-600"
            >
              Change file
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Format */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <label className="block text-xs font-bold text-gray-700 uppercase">Image Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('jpeg')}
                  className={`py-3 rounded-2xl border font-bold text-xs transition-all cursor-pointer ${
                    format === 'jpeg'
                      ? 'border-[#f59e0b] bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  JPG (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('png')}
                  className={`py-3 rounded-2xl border font-bold text-xs transition-all cursor-pointer ${
                    format === 'png'
                      ? 'border-[#f59e0b] bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  PNG (Lossless)
                </button>
              </div>
            </div>

            {/* DPI Quality */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <label className="block text-xs font-bold text-gray-700 uppercase">Image Quality / DPI</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDpi('150')}
                  className={`py-3 rounded-2xl border font-bold text-xs transition-all cursor-pointer ${
                    dpi === '150'
                      ? 'border-[#f59e0b] bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Normal (150 DPI)
                </button>
                <button
                  type="button"
                  onClick={() => setDpi('300')}
                  className={`py-3 rounded-2xl border font-bold text-xs transition-all cursor-pointer ${
                    dpi === '300'
                      ? 'border-[#f59e0b] bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Ultra High (300 DPI)
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={handleExtractImages}
              disabled={loading}
              className="px-10 py-5 rounded-2xl bg-[#f59e0b] hover:bg-amber-600 text-white font-extrabold text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
            >
              <FileImage className="w-6 h-6" />
              <span>{loading ? 'Rendering Images...' : 'Convert PDF to JPG ->'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfToJpgTool;
