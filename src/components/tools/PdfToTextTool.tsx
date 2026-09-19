import React, { useState } from 'react';
import { FileCode, Copy, Download, Check } from 'lucide-react';
import Dropzone from '../common/Dropzone';
import { extractTextFromPdf } from '../../lib/pdfRenderer';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

export const PdfToTextTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [pageCount, setPageCount] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { showToast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = async (files: File[]) => {
    if (!files[0]) return;
    const selected = files[0];
    setFile(selected);
    setLoading(true);

    const startTime = Date.now();
    try {
      const buf = await selected.arrayBuffer();
      const res = await extractTextFromPdf(buf);
      setExtractedText(res.text);
      setPageCount(res.pageCount);

      fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || null,
          tool: 'pdf-to-text',
          execution_mode: 'client',
          status: 'succeeded',
          input_count: 1,
          input_bytes: selected.size,
          output_bytes: new Blob([res.text]).size,
          page_count: res.pageCount,
          duration_ms: Date.now() - startTime,
          file_name: `${selected.name.replace(/\.pdf$/i, '')}.txt`,
        }),
      }).catch(console.error);

      showToast(`Extracted text from ${res.pageCount} pages!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error extracting text from PDF', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    showToast('Text copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace(/\.pdf$/i, '') || 'extracted'}_text.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded .txt file!', 'success');
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelect}
          title="Select PDF to Extract Text"
          subtitle="Extract clean, selectable text and paragraphs with word statistics"
        />
      ) : (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{file.name}</h3>
              <p className="text-xs text-gray-500">
                {pageCount} pages • {extractedText.split(/\s+/).filter(Boolean).length} words • {extractedText.length} chars
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-4 py-2 rounded-xl bg-[#e5322d] hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .TXT</span>
              </button>

              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-xs text-gray-500 hover:text-red-600 ml-2 cursor-pointer"
              >
                Change file
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
            {loading ? (
              <div className="py-20 text-center text-gray-400 text-sm">
                Parsing document structure and extracting text...
              </div>
            ) : (
              <textarea
                readOnly
                value={extractedText}
                rows={16}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono text-gray-800 focus:outline-none resize-y"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfToTextTool;
