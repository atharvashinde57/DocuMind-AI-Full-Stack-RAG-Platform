import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, Trash2, CheckCircle2, RefreshCw, AlertCircle, 
  Layers, HardDrive, Calendar, Database, Eye, Plus
} from 'lucide-react';
import { DocumentItem } from '../types';
import { documentApi } from '../services/api';

interface DocumentDashboardProps {
  onSelectDocForChat?: (docId: string) => void;
}

export const DocumentDashboard: React.FC<DocumentDashboardProps> = ({ onSelectDocForChat }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await documentApi.getAll();
      setDocuments(data);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt'].includes(ext || '')) {
      setUploadStatus({ type: 'error', message: `Unsupported file type .${ext}. Only PDF, DOCX, and TXT are supported.` });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const newDoc = await documentApi.upload(file);
      setUploadStatus({ 
        type: 'success', 
        message: `Successfully processed '${file.name}' into ${newDoc.chunk_count || 12} vector chunks!` 
      });
      fetchDocuments();
    } catch (e: any) {
      setUploadStatus({ type: 'error', message: e.response?.data?.detail || 'Failed to process document.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (docId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete '${filename}' and all its vector embeddings?`)) return;
    try {
      await documentApi.delete(docId);
      setDocuments(documents.filter(d => d.doc_id !== docId));
    } catch {
      alert('Failed to delete document.');
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center space-x-3">
            <Database className="w-8 h-8 text-brand-500" />
            <span>Document Knowledge Base</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your uploaded documents, view vector index status, and inspect total extracted chunk counts.
          </p>
        </div>

        <button
          onClick={fetchDocuments}
          className="self-start md:self-auto flex items-center space-x-2 px-3.5 py-2 rounded-xl glass-card border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-300 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-400' : ''}`} />
          <span>Refresh Store</span>
        </button>
      </div>

      {/* Dropzone Upload Box */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`glass-panel p-8 rounded-3xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center relative ${
          dragActive 
            ? 'border-brand-500 bg-brand-500/10' 
            : 'border-slate-700/80 hover:border-brand-500/50 bg-slate-900/40'
        }`}
      >
        <input
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-4">
          <Upload className={`w-8 h-8 ${uploading ? 'animate-bounce' : ''}`} />
        </div>

        <h3 className="text-lg font-semibold text-white mb-1">
          {uploading ? 'Parsing & Indexing Vectors...' : 'Drop your document here or click to browse'}
        </h3>
        <p className="text-xs text-slate-400 max-w-md mb-4">
          Supports <span className="text-slate-200 font-semibold">PDF, DOCX, TXT</span> documents. Extracted text is automatically split into semantic chunks and embedded in FAISS.
        </p>

        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-lg shadow-brand-600/30 transition-all pointer-events-none">
          <Plus className="w-4 h-4" />
          <span>Select Document File</span>
        </div>
      </div>

      {/* Upload Notification Banner */}
      {uploadStatus && (
        <div className={`p-4 rounded-2xl text-sm flex items-center space-x-3 ${
          uploadStatus.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
        }`}>
          {uploadStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{uploadStatus.message}</span>
        </div>
      )}

      {/* Documents Data Table */}
      <div className="glass-panel rounded-3xl border border-slate-800/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-brand-400" />
            <span>Indexed Documents ({documents.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Total Chunks: {documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0)}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading vector store registry...</div>
        ) : documents.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-base font-medium text-slate-300">No documents indexed yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload your first PDF, DOCX, or TXT file above to build your FAISS vector database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/40">
                  <th className="px-6 py-3.5">Document</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Vector Chunks</th>
                  <th className="px-6 py-3.5">File Size</th>
                  <th className="px-6 py-3.5">Upload Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {documents.map((doc) => (
                  <tr key={doc.doc_id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {doc.file_type || 'TXT'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{doc.filename}</div>
                          <div className="text-[11px] text-slate-500 font-mono">ID: {doc.doc_id.substring(0, 12)}...</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{doc.status || 'Processed'}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-300 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        <span>{doc.chunk_count} chunks</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                      {formatBytes(doc.size_bytes)}
                    </td>

                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {doc.upload_date}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(doc.doc_id, doc.filename)}
                        className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Delete Document & Vectors"
                      >
                        <Trash2 className="w-4 h-4" />
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
