import React, { useState } from 'react';
import { Stamp, Type, Image as ImageIcon, Sparkles } from 'lucide-react';
import Dropzone from '../common/Dropzone';
import ResultScreen from '../common/ResultScreen';
import { watermarkPdf } from '../../lib/pdfEngine';
import { renderPdfThumbnails } from '../../lib/pdfRenderer';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import type { WatermarkOptions, PageThumbnail } from '../../types';

export const WatermarkTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [options, setOptions] = useState<WatermarkOptions>({
    type: 'text',
    text: 'CONFIDENTIAL',
    fontSize: 42,
    fontColor: '#e5322d',
    opacity: 35,
    rotation: 45,
    position: 'center',
    layer: 'above',
    pages: 'all',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
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
      const thumbs = await renderPdfThumbnails(buf, 6);
      setThumbnails(thumbs);
    } catch (e) {
      console.warn('Thumbnail error:', e);
    }
  };

  const handleApplyWatermark = async () => {
    if (!file) return;

    setLoading(true);
    const startTime = Date.now();
    try {
      const finalOpts = { ...options, imageFile: imageFile || undefined };
      const { blob, pageCount } = await watermarkPdf(file, finalOpts);
      const outputName = `${file.name.replace(/\.pdf$/i, '')}_watermarked.pdf`;

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
          tool: 'watermark',
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

      showToast('Watermark applied with precision!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error applying watermark', 'error');
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
        fromTool="watermark-pdf"
      />
    );
  }

  const positions: { id: WatermarkOptions['position']; label: string }[] = [
    { id: 'top-left', label: 'TL' },
    { id: 'top-center', label: 'TC' },
    { id: 'top-right', label: 'TR' },
    { id: 'middle-left', label: 'ML' },
    { id: 'center', label: 'Center' },
    { id: 'middle-right', label: 'MR' },
    { id: 'bottom-left', label: 'BL' },
    { id: 'bottom-center', label: 'BC' },
    { id: 'bottom-right', label: 'BR' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelect}
          title="Select PDF file to Watermark"
          subtitle="Stamp text or image watermarks with custom opacity, rotation & position"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
          {/* Left Preview area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{file.name}</h3>
                  <p className="text-xs text-gray-500">Live preview of watermark placement</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-xs text-gray-500 hover:text-red-600"
                >
                  Change file
                </button>
              </div>

              {/* Visual preview box with live watermark */}
              <div className="mt-6 flex justify-center">
                <div className="relative w-72 aspect-[1/1.414] bg-white border border-gray-300 rounded-xl shadow-md overflow-hidden flex items-center justify-center select-none">
                  {thumbnails[0]?.dataUrl ? (
                    <img src={thumbnails[0].dataUrl} alt="Preview" className="w-full h-full object-contain opacity-70" />
                  ) : (
                    <div className="p-4 text-xs text-gray-400">PDF Page Preview</div>
                  )}

                  {/* Watermark Overlay Simulation */}
                  <div
                    className="absolute inset-0 pointer-events-none flex"
                    style={{
                      justifyContent: options.position.includes('left')
                        ? 'flex-start'
                        : options.position.includes('right')
                        ? 'flex-end'
                        : 'center',
                      alignItems: options.position.includes('top')
                        ? 'flex-start'
                        : options.position.includes('bottom')
                        ? 'flex-end'
                        : 'center',
                      padding: '24px',
                    }}
                  >
                    <div
                      style={{
                        transform: `rotate(${options.rotation}deg)`,
                        color: options.fontColor,
                        opacity: options.opacity / 100,
                        fontSize: `${Math.max(14, options.fontSize * 0.45)}px`,
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {options.type === 'text' ? options.text || 'CONFIDENTIAL' : 'IMAGE WATERMARK'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Watermark Settings Sidebar */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-6">
            <h3 className="font-bold text-gray-900 text-base">Watermark Options</h3>

            {/* Type selector */}
            <div className="flex p-1 bg-gray-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setOptions({ ...options, type: 'text' })}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  options.type === 'text' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                Text Watermark
              </button>
              <button
                type="button"
                onClick={() => setOptions({ ...options, type: 'image' })}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  options.type === 'image' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                Image / Logo
              </button>
            </div>

            {options.type === 'text' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Watermark Text</label>
                  <input
                    type="text"
                    value={options.text}
                    onChange={(e) => setOptions({ ...options, text: e.target.value })}
                    placeholder="e.g. CONFIDENTIAL, DRAFT"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#e5322d]"
                  />
                </div>

                {/* Color and presets */}
                <div className="flex items-center gap-2 pt-1">
                  {['#e5322d', '#10b981', '#3b82f6', '#0f172a', '#64748b'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setOptions({ ...options, fontColor: c })}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        options.fontColor === c ? 'scale-125 ring-2 ring-gray-400' : ''
                      }`}
                    />
                  ))}
                  <input
                    type="color"
                    value={options.fontColor}
                    onChange={(e) => setOptions({ ...options, fontColor: e.target.value })}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Upload Logo Image (PNG / JPG)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-[#e5322d]"
                />
              </div>
            )}

            {/* 9-Point Grid Position */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Position on Page</label>
              <div className="grid grid-cols-3 gap-1.5 w-44 mx-auto bg-gray-100 p-2 rounded-2xl">
                {positions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setOptions({ ...options, position: p.id })}
                    className={`py-2 text-[10px] font-bold rounded-lg transition-all ${
                      options.position === p.id
                        ? 'bg-[#e5322d] text-white shadow-xs'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders for Opacity & Rotation */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span>Transparency / Opacity</span>
                  <span>{options.opacity}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={options.opacity}
                  onChange={(e) => setOptions({ ...options, opacity: parseInt(e.target.value, 10) })}
                  className="w-full accent-[#e5322d]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span>Rotation Angle</span>
                  <span>{options.rotation}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={options.rotation}
                  onChange={(e) => setOptions({ ...options, rotation: parseInt(e.target.value, 10) })}
                  className="w-full accent-[#e5322d]"
                />
              </div>
            </div>

            {/* Big Action Button */}
            <button
              type="button"
              onClick={handleApplyWatermark}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#e5322d] hover:bg-red-700 text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Stamp className="w-5 h-5" />
              <span>{loading ? 'Applying Watermark...' : 'Watermark PDF ->'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatermarkTool;
