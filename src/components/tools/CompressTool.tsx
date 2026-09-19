import React, { useState, useEffect } from 'react';
import { Minimize2, Zap, Shield, Sparkles, Eye } from 'lucide-react';
import Dropzone from '../common/Dropzone';
import ResultScreen from '../common/ResultScreen';
import PdfThumbnailPreview from '../common/PdfThumbnailPreview';
import { compressPdf } from '../../lib/pdfEngine';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkflow } from '../../contexts/WorkflowContext';

export const CompressTool: React.FC = () => {
  const { activeFile } = useWorkflow();
  const [file, setFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [level, setLevel] = useState<'extreme' | 'recommended' | 'less'>('recommended');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeFile && !file) {
      setFile(new File([activeFile.blob], activeFile.name, { type: 'application/pdf' }));
    }
  }, [activeFile]);
  const [result, setResult] = useState<{
    blob: Blob;
    fileName: string;
    originalSize: number;
    compressedSize: number;
    savingsBytes: number;
    savingsPercent: number;
  } | null>(null);

  const { showToast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = (files: File[]) => {
    if (files[0]) setFile(files[0]);
  };

  const handleCompress = async () => {
    if (!file) return;

    setLoading(true);
    const startTime = Date.now();
    try {
      const res = await compressPdf(file, level);
      const outputName = `${file.name.replace(/\.pdf$/i, '')}_compressed.pdf`;

      setResult({
        blob: res.blob,
        fileName: outputName,
        originalSize: res.originalSize,
        compressedSize: res.compressedSize,
        savingsBytes: res.savingsBytes,
        savingsPercent: res.savingsPercent,
      });

      // Log telemetry
      fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || null,
          tool: 'compress',
          execution_mode: 'client',
          status: 'succeeded',
          input_count: 1,
          input_bytes: res.originalSize,
          output_bytes: res.compressedSize,
          savings_bytes: res.savingsBytes,
          duration_ms: Date.now() - startTime,
          file_name: outputName,
        }),
      }).catch(console.error);

      showToast(`Reduced file size by ${res.savingsPercent}%!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error compressing PDF', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <ResultScreen
        blob={result.blob}
        fileName={result.fileName}
        originalSize={result.originalSize}
        compressedSize={result.compressedSize}
        savingsBytes={result.savingsBytes}
        savingsPercent={result.savingsPercent}
        fromTool="compress-pdf"
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelect}
          title="Select PDF file to Compress"
          subtitle="Reduce file size while preserving high visual quality"
        />
      ) : (
        <div className="space-y-8 animate-in fade-in">
          {/* File Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">{file.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Current Size: <strong>{(file.size / 1024).toFixed(1)} KB</strong> ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px]"
              >
                <Eye className="w-3.5 h-3.5 text-rose-600" />
                <span>Verify Pages</span>
              </button>
              <button
                onClick={() => setFile(null)}
                className="text-xs font-semibold text-gray-500 hover:text-red-600 cursor-pointer min-h-[36px] px-2 flex items-center"
              >
                Change file
              </button>
            </div>
          </div>

          {/* Compression Level Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Extreme */}
            <button
              type="button"
              onClick={() => setLevel('extreme')}
              className={`p-6 rounded-3xl border-2 text-left transition-all cursor-pointer ${
                level === 'extreme'
                  ? 'border-[#e5322d] bg-red-50/40 ring-2 ring-red-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-[#e5322d] flex items-center justify-center font-bold mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <div className="font-extrabold text-base text-gray-900">Extreme Compression</div>
              <div className="text-xs text-gray-500 mt-1">Less quality, high compression. Up to ~60% size drop.</div>
            </button>

            {/* Recommended */}
            <button
              type="button"
              onClick={() => setLevel('recommended')}
              className={`p-6 rounded-3xl border-2 text-left transition-all relative cursor-pointer ${
                level === 'recommended'
                  ? 'border-[#10b981] bg-emerald-50/40 ring-2 ring-emerald-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                RECOMMENDED
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="font-extrabold text-base text-gray-900">Recommended</div>
              <div className="text-xs text-gray-500 mt-1">Good quality, good compression. Ideal for web & email.</div>
            </button>

            {/* Less */}
            <button
              type="button"
              onClick={() => setLevel('less')}
              className={`p-6 rounded-3xl border-2 text-left transition-all cursor-pointer ${
                level === 'less'
                  ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <div className="font-extrabold text-base text-gray-900">Less Compression</div>
              <div className="text-xs text-gray-500 mt-1">High quality, modest compression. Best for print.</div>
            </button>
          </div>

          {/* Action CTA */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleCompress}
              disabled={loading}
              className="px-10 py-5 rounded-2xl bg-[#10b981] hover:bg-emerald-600 text-white font-extrabold text-lg shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
            >
              <Minimize2 className="w-6 h-6" />
              <span>{loading ? 'Optimizing PDF Stream...' : 'Compress PDF ->'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Client-Side PDF Thumbnail Preview Modal */}
      <PdfThumbnailPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        file={file}
        fileName={file?.name}
        currentToolName="Compress PDF"
        onConfirmFile={(confirmed) => {
          setFile(confirmed);
        }}
      />
    </div>
  );
};

export default CompressTool;
