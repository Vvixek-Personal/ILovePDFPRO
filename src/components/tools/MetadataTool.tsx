import React, { useState } from 'react';
import { Sliders, Save, Trash2 } from 'lucide-react';
import Dropzone from '../common/Dropzone';
import ResultScreen from '../common/ResultScreen';
import { editPdfMetadata } from '../../lib/pdfEngine';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import type { MetadataOptions } from '../../types';

export const MetadataTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<MetadataOptions>({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: 'iLovePDF Platform',
    producer: 'iLovePDF',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; fileName: string; pageCount: number } | null>(null);

  const { showToast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = (files: File[]) => {
    if (!files[0]) return;
    const selected = files[0];
    setFile(selected);
    setMetadata({
      title: selected.name.replace(/\.pdf$/i, '').replace(/_/g, ' '),
      author: user?.email?.split('@')[0] || 'Author',
      subject: 'Official Document',
      keywords: 'report, verified, document',
      creator: 'iLovePDF Platform',
      producer: 'iLovePDF',
    });
  };

  const handleClearAll = () => {
    setMetadata({
      title: '',
      author: '',
      subject: '',
      keywords: '',
      creator: '',
      producer: '',
    });
    showToast('All metadata properties cleared for privacy', 'info');
  };

  const handleSave = async () => {
    if (!file) return;

    setLoading(true);
    const startTime = Date.now();
    try {
      const { blob, pageCount } = await editPdfMetadata(file, metadata);
      const outputName = `${file.name.replace(/\.pdf$/i, '')}_metadata.pdf`;

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
          tool: 'metadata-editor',
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

      showToast('Document metadata updated!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error updating metadata', 'error');
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
        fromTool="metadata-editor"
      />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelect}
          title="Select PDF for Metadata Editor"
          subtitle="View, edit, or wipe Title, Author, Subject, Keywords, Creator information"
        />
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-base">{file.name}</h3>
              <p className="text-xs text-gray-500">Document Properties</p>
            </div>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Wipe All Metadata
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Document Title</label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#e5322d]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Author</label>
                <input
                  type="text"
                  value={metadata.author}
                  onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#e5322d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={metadata.subject}
                  onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#e5322d]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Keywords (Comma separated)</label>
              <input
                type="text"
                value={metadata.keywords}
                onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#e5322d]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Application Creator</label>
                <input
                  type="text"
                  value={metadata.creator}
                  onChange={(e) => setMetadata({ ...metadata, creator: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#e5322d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">PDF Producer</label>
                <input
                  type="text"
                  value={metadata.producer}
                  onChange={(e) => setMetadata({ ...metadata, producer: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#e5322d]"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-[#e5322d] hover:bg-red-700 text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Updating Metadata...' : 'Save Updated PDF ->'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MetadataTool;
