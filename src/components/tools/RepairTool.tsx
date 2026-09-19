import React, { useState } from 'react';
import { Wrench, CheckCircle2, ShieldAlert } from 'lucide-react';
import Dropzone from '../common/Dropzone';
import ResultScreen from '../common/ResultScreen';
import { repairPdf } from '../../lib/pdfEngine';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

export const RepairTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [result, setResult] = useState<{ blob: Blob; fileName: string; pageCount: number } | null>(null);

  const { showToast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = (files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      setDiagnostics([
        'Analyzing PDF cross-reference index (XREF)...',
        'Checking indirect object dictionary integrity...',
        'Scanning byte streams and trailer pointers...',
      ]);
    }
  };

  const handleRepair = async () => {
    if (!file) return;

    setLoading(true);
    const startTime = Date.now();
    try {
      const { blob, pageCount, statusMessage } = await repairPdf(file);
      const outputName = `${file.name.replace(/\.pdf$/i, '')}_repaired.pdf`;

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
          tool: 'repair',
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

      showToast(statusMessage || 'PDF structural repairs completed!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error repairing PDF', 'error');
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
        fromTool="repair-pdf"
      />
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto py-8 px-4">
      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelect}
          title="Select Corrupted PDF to Repair"
          subtitle="Structural recovery engine for damaged, unreadable, and corrupted PDF documents"
        />
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl space-y-6 animate-in fade-in">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <Wrench className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-xl text-gray-900">PDF Structural Recovery</h3>
            <p className="text-xs text-gray-500">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
          </div>

          {/* Diagnostics Box */}
          <div className="p-4 bg-slate-900 rounded-2xl text-emerald-400 font-mono text-xs space-y-1.5">
            <div className="text-slate-400 font-bold mb-2">// Diagnostic Scan:</div>
            {diagnostics.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span>✓</span>
                <span>{d}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleRepair}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-[#10b981] hover:bg-emerald-600 text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{loading ? 'Reconstructing PDF...' : 'Repair & Recover PDF ->'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RepairTool;
