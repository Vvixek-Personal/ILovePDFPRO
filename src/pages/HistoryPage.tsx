import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Trash2, Download, Filter, Search, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { JobRecord } from '../types';

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTool, setFilterTool] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const url = user ? `/api/jobs?user_id=${user.id}` : '/api/jobs?limit=50';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setJobs(data);
      }
    } catch (err) {
      console.error('Failed to load jobs history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleDeleteJob = async (id: number | string) => {
    try {
      const res = await fetch('/api/jobs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setJobs(jobs.filter((j) => j.id !== id));
        showToast('Record removed from history', 'info');
      }
    } catch (err) {
      showToast('Error deleting job', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear your entire processing history?')) return;
    try {
      if (user) {
        await fetch('/api/jobs', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, clear_all: true }),
        });
      }
      setJobs([]);
      showToast('Processing history cleared', 'success');
    } catch (err) {
      showToast('Error clearing history', 'error');
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesTool = filterTool === 'all' || j.tool === filterTool;
    const matchesSearch = j.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTool && matchesSearch;
  });

  const totalProcessedBytes = jobs.reduce((acc, j) => acc + (j.input_bytes || 0), 0);
  const totalSavingsBytes = jobs.reduce((acc, j) => acc + (j.savings_bytes || 0), 0);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Processing History & Stats</h1>
          <p className="text-xs text-gray-500 mt-1">
            Track all PDF manipulations, throughput, and optimization savings.
          </p>
        </div>

        {jobs.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
          >
            <Trash2 className="w-4 h-4" /> Clear All History
          </button>
        )}
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Operations</div>
          <div className="text-3xl font-black text-gray-900">{jobs.length}</div>
          <div className="text-[11px] text-gray-500">Tasks logged in telemetry</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Data Throughput</div>
          <div className="text-3xl font-black text-emerald-600">
            {(totalProcessedBytes / (1024 * 1024)).toFixed(1)} MB
          </div>
          <div className="text-[11px] text-gray-500">Processed locally with zero leakage</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-[#e5322d] uppercase tracking-wider">Storage Savings</div>
          <div className="text-3xl font-black text-[#e5322d]">
            {(totalSavingsBytes / (1024 * 1024)).toFixed(1)} MB
          </div>
          <div className="text-[11px] text-gray-500">Optimized via stream compression</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by file name..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e5322d]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">Filter Tool:</span>
          <select
            value={filterTool}
            onChange={(e) => setFilterTool(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
          >
            <option value="all">All Tools</option>
            <option value="merge">Merge</option>
            <option value="split">Split</option>
            <option value="compress">Compress</option>
            <option value="sign">Sign</option>
            <option value="watermark">Watermark</option>
            <option value="rotate">Rotate</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading activity records...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Clock className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="font-bold text-gray-800 text-base">No processing records found</h4>
            <p className="text-xs text-gray-400">Process any document to see it logged here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-6">File Name</th>
                  <th className="py-3.5 px-4">Tool Used</th>
                  <th className="py-3.5 px-4">Input Size</th>
                  <th className="py-3.5 px-4">Output Size</th>
                  <th className="py-3.5 px-4">Speed</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900 truncate max-w-xs" title={job.file_name}>
                      {job.file_name}
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-red-50 text-[#e5322d] font-bold px-2 py-0.5 rounded-full text-[11px] uppercase">
                        {job.tool}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {(job.input_bytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-4 px-4 text-gray-900 font-bold">
                      {(job.output_bytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-4 px-4 text-emerald-600 font-mono">
                      {job.duration_ms}ms
                    </td>
                    <td className="py-4 px-4 text-gray-500">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
