import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardDrive, Star, Trash2, Plus, ArrowRight, Search, FileText, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useWorkflow } from '../contexts/WorkflowContext';
import type { VaultItem } from '../types';

export const VaultPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { handoffToTool } = useWorkflow();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchVault = async () => {
    setLoading(true);
    try {
      const url = user ? `/api/vault?user_id=${user.id}` : '/api/vault';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setDocuments(data);
      }
    } catch (err) {
      console.error('Vault fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVault();
  }, [user]);

  const handleToggleStar = async (doc: VaultItem) => {
    const updated = !doc.is_starred;
    setDocuments(documents.map((d) => (d.id === doc.id ? { ...d, is_starred: updated } : d)));

    try {
      await fetch('/api/vault', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: doc.id, is_starred: updated }),
      });
      showToast(updated ? 'Starred document' : 'Unstarred document', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch('/api/vault', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setDocuments(documents.filter((d) => d.id !== id));
        showToast('Document removed from vault', 'info');
      }
    } catch (err) {
      showToast('Error deleting document', 'error');
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    setUploading(true);
    try {
      const res = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || 'guest',
          name: file.name,
          size: file.size,
          page_count: 1,
          tags: 'Uploaded, User File',
        }),
      });

      if (res.ok) {
        showToast('Document added to vault!', 'success');
        fetchVault();
      }
    } catch (err) {
      showToast('Error saving to vault', 'error');
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.tags && d.tags.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Document Cloud Vault</h1>
          <p className="text-xs text-gray-500 mt-1">
            Store, organize, and quickly open your processed PDFs in any tool.
          </p>
        </div>

        <label className="px-5 py-2.5 rounded-2xl bg-[#e5322d] hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer self-start md:self-auto">
          <Plus className="w-4 h-4" />
          <span>{uploading ? 'Adding...' : 'Add PDF to Vault'}</span>
          <input type="file" accept=".pdf" onChange={handleUploadFile} className="hidden" />
        </label>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vault documents..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e5322d]"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-gray-400 text-sm">
            Loading cloud vault...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="col-span-full py-16 text-center space-y-3 bg-white rounded-3xl border border-gray-200 p-8">
            <HardDrive className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="font-bold text-gray-800 text-base">Your Vault is empty</h4>
            <p className="text-xs text-gray-400">Save processed PDFs or upload new documents above.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4 relative group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#e5322d] flex items-center justify-center font-bold flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>

                <button
                  onClick={() => handleToggleStar(doc)}
                  className="p-1.5 text-gray-300 hover:text-amber-400 transition-colors"
                >
                  <Star className={`w-5 h-5 ${doc.is_starred ? 'text-amber-400 fill-amber-400' : ''}`} />
                </button>
              </div>

              <div>
                <h3 className="font-bold text-sm text-gray-900 truncate" title={doc.name}>
                  {doc.name}
                </h3>
                <p className="text-[11px] text-gray-500 mt-1">
                  {(doc.size / 1024).toFixed(1)} KB • {doc.page_count} {doc.page_count === 1 ? 'page' : 'pages'}
                </p>
                {doc.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {doc.tags.split(',').map((tag, i) => (
                      <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-semibold">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                <button
                  onClick={() => navigate('/organize-pdf')}
                  className="text-xs font-bold text-[#e5322d] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open in Tools</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                  title="Remove from vault"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VaultPage;
