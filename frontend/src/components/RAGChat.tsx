import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Sparkles, FileText, ExternalLink, ShieldCheck, 
  HelpCircle, RefreshCw, X, ChevronRight, CheckCircle2, AlertTriangle, Layers
} from 'lucide-react';
import { ChatMessage, SourceCitation, DocumentItem } from '../types';
import { chatApi, documentApi } from '../services/api';

export const RAGChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      content: 'Hello! I am DocuMind AI. Ask me any question based on your uploaded documents, or select a document prompt mode below.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [promptType, setPromptType] = useState<'qa' | 'summarize' | 'analysis'>('qa');
  const [loading, setLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<SourceCitation | null>(null);
  const [availableDocs, setAvailableDocs] = useState<DocumentItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    documentApi.getAll().then(setAvailableDocs).catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await chatApi.sendMessage(currentInput, 'default', selectedDocIds, promptType);
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: res.answer,
        confidence: res.confidence,
        sources: res.sources,
        debug_info: res.debug_info,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          content: 'Sorry, I encountered an error while searching the vector index. Please check that FastAPI is running.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col">
      
      {/* Top Controls Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 mb-4 flex flex-wrap items-center justify-between gap-4">
        {/* Prompt Modes */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Mode:</span>
          
          <button
            onClick={() => setPromptType('qa')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              promptType === 'qa'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Question Answering
          </button>

          <button
            onClick={() => setPromptType('summarize')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              promptType === 'summarize'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Executive Summary
          </button>

          <button
            onClick={() => setPromptType('analysis')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              promptType === 'analysis'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Document Analysis
          </button>
        </div>

        {/* Clear Chat */}
        <button
          onClick={() => setMessages([])}
          className="text-xs text-slate-400 hover:text-slate-200 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-800"
        >
          Clear Chat
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass-panel rounded-3xl border border-slate-800/80 overflow-hidden flex flex-col relative">
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3.5 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white ${
                msg.sender === 'user' 
                  ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20' 
                  : 'bg-gradient-to-tr from-brand-600 via-blue-500 to-cyan-400 shadow-md shadow-brand-500/20'
              }`}>
                {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Content Bubble */}
              <div className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-none shadow-lg shadow-brand-600/20'
                  : 'glass-card border border-slate-800/80 text-slate-200 rounded-tl-none'
              }`}>
                
                {/* Confidence Badge for Assistant */}
                {msg.sender === 'assistant' && msg.confidence !== undefined && (
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-xs">
                    <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{Math.round(msg.confidence * 100)}% Grounded Confidence</span>
                    </span>
                    <span className="text-slate-500 text-[11px]">{msg.timestamp}</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Sources Section */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-brand-400" />
                      <span>Source Citations ({msg.sources.length}):</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((src, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveCitation(src)}
                          className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs text-brand-300 transition-colors"
                        >
                          <FileText className="w-3 h-3 text-brand-400" />
                          <span>{src.document}</span>
                          <span className="text-slate-500 text-[10px]">p. {src.page}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3 text-slate-400 text-xs">
              <div className="w-8 h-8 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center animate-spin">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>Searching FAISS vector embeddings & generating grounded response...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 glass-panel border-t border-slate-800/80 flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              promptType === 'summarize'
                ? "Click send to summarize indexed documents..."
                : promptType === 'analysis'
                ? "Enter specific analysis request (e.g. audit key terms)..."
                : "Ask a question about your uploaded documents..."
            }
            className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />

          <button
            type="submit"
            disabled={loading || (!input.trim() && promptType === 'qa')}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/25 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

      {/* Source Inspection Drawer */}
      {activeCitation && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md h-full glass-panel border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-brand-400" />
                  <h3 className="font-semibold text-white">Retrieved Source Chunk</h3>
                </div>
                <button
                  onClick={() => setActiveCitation(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Document Name</label>
                  <div className="text-sm font-medium text-white">{activeCitation.document}</div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Page Number</label>
                  <div className="text-sm font-medium text-slate-300">Page {activeCitation.page}</div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Chunk ID</label>
                  <div className="text-xs font-mono text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800">{activeCitation.chunk_id}</div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Retrieved Snippet</label>
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs leading-relaxed text-slate-200">
                    "{activeCitation.snippet}"
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveCitation(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
