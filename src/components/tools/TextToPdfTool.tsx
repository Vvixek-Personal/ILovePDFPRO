import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import ResultScreen from '../common/ResultScreen';
import { convertTextToPdf } from '../../lib/pdfEngine';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

export const TextToPdfTool: React.FC = () => {
  const [title, setTitle] = useState('Official Report 2026');
  const [text, setText] = useState(
    `# Executive Summary\n\nThis document was generated directly from structured plain text.\n\n## Section 1: Overview\niLovePDF provides lightning-fast document transformation. You can convert raw text notes, markdown articles, logs, and formatted transcripts into clean, paginated PDF files with standard typography.\n\n## Section 2: Privacy Notice\nAll compilation is handled completely in your browser with zero latency and zero data leakage.`
  );
  const [fontSize, setFontSize] = useState(12);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; fileName: string; pageCount: number } | null>(null);

  const { showToast } = useToast();
  const { user } = useAuth();

  const handleGeneratePdf = async () => {
    if (!text.trim()) {
      showToast('Please enter text to convert.', 'warning');
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    try {
      const { blob, pageCount } = await convertTextToPdf(text, { title, fontSize });
      const outputName = `${title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'document'}.pdf`;

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
          tool: 'text-to-pdf',
          execution_mode: 'client',
          status: 'succeeded',
          input_count: 1,
          input_bytes: new Blob([text]).size,
          output_bytes: blob.size,
          page_count: pageCount,
          duration_ms: Date.now() - startTime,
          file_name: outputName,
        }),
      }).catch(console.error);

      showToast(`Generated PDF with ${pageCount} pages!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error generating PDF', 'error');
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
        fromTool="text-to-pdf"
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Document Header Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Project Proposal"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#e5322d]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Font Size (pt)</label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
            >
              <option value="10">10 pt (Compact)</option>
              <option value="12">12 pt (Standard)</option>
              <option value="14">14 pt (Large)</option>
              <option value="16">16 pt (Reading)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Text Content / Markdown</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            placeholder="Type or paste your text here..."
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono text-gray-800 focus:outline-none focus:border-[#e5322d]"
          />
        </div>

        <button
          onClick={handleGeneratePdf}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-[#3b82f6] hover:bg-blue-600 text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileText className="w-5 h-5" />
          <span>{loading ? 'Formatting Document...' : 'Generate PDF ->'}</span>
        </button>
      </div>
    </div>
  );
};

export default TextToPdfTool;
