import React, { useState, useRef, useEffect } from 'react';
import { FileSignature, PenTool, Type, Image as ImageIcon, Check, RotateCcw, Sparkles } from 'lucide-react';
import Dropzone from '../common/Dropzone';
import ResultScreen from '../common/ResultScreen';
import { signPdf } from '../../lib/pdfEngine';
import { renderPdfThumbnails } from '../../lib/pdfRenderer';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import type { SignAnnotation, PageThumbnail } from '../../types';

export const SignTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [selectedPage, setSelectedPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');

  // Draw State
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#1e293b');

  // Type State
  const [typedName, setTypedName] = useState('Alex Morgan');
  const [selectedFont, setSelectedFont] = useState<'cursive' | 'serif' | 'script'>('cursive');

  // Upload state
  const [uploadedStamp, setUploadedStamp] = useState<string | null>(null);

  // Placed signature positions on document
  const [placedSignatures, setPlacedSignatures] = useState<SignAnnotation[]>([]);
  const [currentSignatureDataUrl, setCurrentSignatureDataUrl] = useState<string | null>(null);

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
      console.warn('Thumbnail rendering error:', e);
    }
  };

  // Setup drawing canvas
  useEffect(() => {
    if (activeTab === 'draw' && drawCanvasRef.current) {
      const canvas = drawCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = penColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeTab, penColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'clientX' in e ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
    const y = 'clientY' in e ? e.clientY - rect.top : e.touches[0].clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'clientX' in e ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
    const y = 'clientY' in e ? e.clientY - rect.top : e.touches[0].clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && drawCanvasRef.current) {
      setIsDrawing(false);
      setCurrentSignatureDataUrl(drawCanvasRef.current.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = drawCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setCurrentSignatureDataUrl(null);
    }
  };

  // Generate image for typed signature
  const generateTypedSignatureDataUrl = (name: string, fontType: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = penColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    if (fontType === 'cursive') ctx.font = 'italic 42px "Brush Script MT", cursive, sans-serif';
    else if (fontType === 'serif') ctx.font = 'italic 38px "Georgia", serif';
    else ctx.font = 'italic 36px "Segoe Script", cursive, sans-serif';

    ctx.fillText(name, 200, 60);
    return canvas.toDataURL('image/png');
  };

  const handlePlaceSignatureOnPage = () => {
    let signatureUrl = currentSignatureDataUrl;

    if (activeTab === 'type') {
      signatureUrl = generateTypedSignatureDataUrl(typedName, selectedFont);
    } else if (activeTab === 'upload') {
      signatureUrl = uploadedStamp;
    }

    if (!signatureUrl) {
      showToast('Please draw or type your signature first.', 'warning');
      return;
    }

    const newSig: SignAnnotation = {
      id: Math.random().toString(36).substring(2, 9),
      type: activeTab === 'upload' ? 'stamp' : activeTab,
      dataUrl: signatureUrl,
      pageNumber: selectedPage,
      x: 35, // percentage
      y: 65, // percentage
      width: 30, // percentage
      height: 12, // percentage
    };

    setPlacedSignatures([...placedSignatures, newSig]);
    showToast(`Signature placed on Page ${selectedPage}!`, 'success');
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedStamp(reader.result as string);
        setCurrentSignatureDataUrl(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSignDocument = async () => {
    if (!file || placedSignatures.length === 0) {
      showToast('Please place at least one signature on a page.', 'warning');
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    try {
      const { blob, pageCount } = await signPdf(file, placedSignatures);
      const outputName = `${file.name.replace(/\.pdf$/i, '')}_signed.pdf`;

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
          tool: 'sign',
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

      showToast('Document signed successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error signing document', 'error');
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
        fromTool="sign-pdf"
      />
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelect}
          title="Select PDF file to Sign"
          subtitle="Draw signature, type cursive calligraphy, or upload your signature stamp"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
          {/* Left Canvas Document Preview (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{file.name}</h3>
                  <p className="text-xs text-gray-500">
                    Signing Page {selectedPage} of {thumbnails.length}
                  </p>
                </div>

                <div className="flex items-center gap-2">
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

              {/* Interactive PDF Sheet with Drag-placed Signatures */}
              <div className="mt-6 flex justify-center">
                <div className="relative w-full max-w-md aspect-[1/1.414] bg-white border border-gray-300 rounded-xl shadow-md overflow-hidden select-none">
                  {thumbnails[selectedPage - 1]?.dataUrl ? (
                    <img
                      src={thumbnails[selectedPage - 1].dataUrl}
                      alt="Current Page"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="p-8 text-xs text-gray-400">Loading Page Preview...</div>
                  )}

                  {/* Render placed signatures on this page */}
                  {placedSignatures
                    .filter((s) => s.pageNumber === selectedPage)
                    .map((sig) => (
                      <div
                        key={sig.id}
                        style={{
                          position: 'absolute',
                          left: `${sig.x}%`,
                          top: `${sig.y}%`,
                          width: `${sig.width}%`,
                          height: `${sig.height}%`,
                        }}
                        className="border-2 border-dashed border-[#8b5cf6] bg-purple-50/40 rounded-lg p-1 group flex items-center justify-center cursor-move"
                      >
                        <img src={sig.dataUrl} alt="Signature" className="max-w-full max-h-full object-contain" />
                        <button
                          onClick={() => setPlacedSignatures(placedSignatures.filter((s) => s.id !== sig.id))}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Signature Creator Palette (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
              <h3 className="font-bold text-gray-900 text-base">Create Your Signature</h3>

              {/* Tabs */}
              <div className="flex p-1 bg-gray-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('draw')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'draw' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" /> Draw
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('type')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'type' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" /> Type
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'upload' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Upload
                </button>
              </div>

              {/* Draw Pad */}
              {activeTab === 'draw' && (
                <div className="space-y-3">
                  <div className="border border-gray-300 rounded-2xl bg-white overflow-hidden relative shadow-inner">
                    <canvas
                      ref={drawCanvasRef}
                      width={380}
                      height={160}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-40 cursor-crosshair touch-none"
                    />
                    <div className="absolute bottom-2 left-3 text-[10px] text-gray-400">Sign above the line</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {['#1e293b', '#1d4ed8', '#b91c1c'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setPenColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-5 h-5 rounded-full ${penColor === c ? 'ring-2 ring-gray-400 scale-110' : ''}`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-xs font-semibold text-gray-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Type Signature */}
              {activeTab === 'type' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">Choose Calligraphy Style</label>
                    {(['cursive', 'serif', 'script'] as const).map((font) => (
                      <button
                        key={font}
                        type="button"
                        onClick={() => setSelectedFont(font)}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          selectedFont === font
                            ? 'border-[#8b5cf6] bg-purple-50/40 text-purple-900'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span
                          className="text-xl"
                          style={{
                            fontFamily: font === 'cursive' ? 'Brush Script MT, cursive' : font === 'serif' ? 'Georgia, serif' : 'Segoe Script, cursive',
                          }}
                        >
                          {typedName || 'Your Signature'}
                        </span>
                        {selectedFont === font && <Check className="w-4 h-4 text-purple-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Stamp */}
              {activeTab === 'upload' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700">Upload Transparent PNG / Stamp</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStampUpload}
                    className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-600"
                  />
                  {uploadedStamp && (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center h-28">
                      <img src={uploadedStamp} alt="Uploaded" className="max-h-full object-contain" />
                    </div>
                  )}
                </div>
              )}

              {/* Add to Page Button */}
              <button
                type="button"
                onClick={handlePlaceSignatureOnPage}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" /> Place on Page {selectedPage}
              </button>

              {/* Final Complete Sign Document CTA */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleSignDocument}
                  disabled={loading || placedSignatures.length === 0}
                  className="w-full py-4 rounded-2xl bg-[#8b5cf6] hover:bg-purple-600 text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <FileSignature className="w-5 h-5" />
                  <span>{loading ? 'Embedding Signature...' : `Sign Document (${placedSignatures.length} placed) ->`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignTool;
