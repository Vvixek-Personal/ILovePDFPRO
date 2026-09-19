import React, { useState } from 'react';
import { ListOrdered, Check } from 'lucide-react';
import Dropzone from '../common/Dropzone';
import ResultScreen from '../common/ResultScreen';
import { addPageNumbersToPdf } from '../../lib/pdfEngine';
import { renderPdfThumbnails } from '../../lib/pdfRenderer';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import type { PageNumberOptions, PageThumbnail } from '../../types';

export const PageNumbersTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [options, setOptions] = useState<PageNumberOptions>({
    position: 'bottom-center',
    format: 'page_n_of_m',
    startNumber: 1,
    fontSize: 11,
    color: '#334155',
    margin: 30,
    pages: 'all',
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

  const handleApplyNumbers = async () => {
    if (!file) return;

    setLoading(true);
    const startTime = Date.now();
    try {
      const { blob, pageCount } = await addPageNumbersToPdf(file, options);
      const outputName = `${file.name.replace(/\.pdf$/i, '')}_numbered.pdf`;

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
          tool: 'page-numbers',
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

      showToast('Page numbers added successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error numbering PDF', 'error');
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
        fromTool="page-numbers"
      />
    );
  }

  const positions: { id: PageNumberOptions['position']; label: string }[] = [
    { id: 'top-left', label: 'Top Left' },
    { id: 'top-center', label: 'Top Center' },
    { id: 'top-right', label: 'Top Right' },
    { id: 'bottom-left', label: 'Bottom Left' },
    { id: 'bottom-center', label: 'Bottom Center' },
    { id: 'bottom-right', label: 'Bottom Right' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelect}
          title="Select PDF to Add Page Numbers"
          subtitle="Choose position, format, typography and start number"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
          {/* Preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{file.name}</h3>
                  <p className="text-xs text-gray-500">Live preview of footer/header numbering</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-xs text-gray-500 hover:text-red-600"
                >
                  Change file
                </button>
              </div>

              <div className="mt-6 flex justify-center">
                <div className="relative w-72 aspect-[1/1.414] bg-white border border-gray-300 rounded-xl shadow-md overflow-hidden flex items-center justify-center">
                  {thumbnails[0]?.dataUrl ? (
                    <img src={thumbnails[0].dataUrl} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="p-4 text-xs text-gray-400">PDF Page Preview</div>
                  )}

                  {/* Number simulation badge */}
                  <div
                    className="absolute font-mono text-[11px] font-bold px-2 py-0.5 bg-red-500 text-white rounded shadow-sm"
                    style={{
                      bottom: options.position.includes('bottom') ? '16px' : 'auto',
                      top: options.position.includes('top') ? '16px' : 'auto',
                      left: options.position.includes('left')
                        ? '16px'
                        : options.position.includes('center')
                        ? '50%'
                        : 'auto',
                      right: options.position.includes('right') ? '16px' : 'auto',
                      transform: options.position.includes('center') ? 'translateX(-50%)' : 'none',
                    }}
                  >
                    {options.format === 'page_n_of_m'
                      ? 'Page 1 of 3'
                      : options.format === 'page_n'
                      ? 'Page 1'
                      : '1'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
            <h3 className="font-bold text-gray-900 text-base">Page Number Settings</h3>

            {/* Position */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Position</label>
              <div className="grid grid-cols-2 gap-2">
                {positions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setOptions({ ...options, position: p.id })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                      options.position === p.id
                        ? 'border-[#e5322d] bg-red-50 text-[#e5322d]'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Format</label>
              <select
                value={options.format}
                onChange={(e) => setOptions({ ...options, format: e.target.value as any })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none"
              >
                <option value="page_n_of_m">Page 1 of 20 (Full format)</option>
                <option value="page_n">Page 1</option>
                <option value="number">1 (Single number)</option>
                <option value="n_of_m">1 / 20</option>
              </select>
            </div>

            {/* Start Number & Page Rules */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Start Number</label>
                <input
                  type="number"
                  min="1"
                  value={options.startNumber}
                  onChange={(e) => setOptions({ ...options, startNumber: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Cover Page Rule</label>
                <select
                  value={options.pages}
                  onChange={(e) => setOptions({ ...options, pages: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                >
                  <option value="all">Number all pages</option>
                  <option value="exclude-first">Skip cover (first page)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyNumbers}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#e5322d] hover:bg-red-700 text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ListOrdered className="w-5 h-5" />
              <span>{loading ? 'Adding Numbers...' : 'Add Page Numbers ->'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageNumbersTool;
