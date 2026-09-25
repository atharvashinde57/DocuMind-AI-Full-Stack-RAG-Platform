import React from 'react';
import { 
  Brain, FileText, Sparkles, Database, Layers, Search, CheckCircle2, 
  ArrowRight, Shield, Zap, GitBranch, Terminal, Cpu
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-dark-bg text-slate-100 flex flex-col items-center justify-between pb-16">
      
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl px-6 pt-16 pb-20 mx-auto text-center flex flex-col items-center">
        {/* Glow backdrop */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Production-Grade RAG Architecture</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mb-6">
          Chat with your Enterprise Documents using <span className="bg-gradient-to-r from-brand-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">Grounded AI</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl font-light mb-10 leading-relaxed">
          Upload PDF, DOCX, and TXT files to extract instant, accurate, and hallucination-free answers backed by FAISS vector similarity search and source citations.
        </p>

        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 via-blue-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-semibold text-base shadow-xl shadow-brand-600/30 hover:shadow-brand-500/50 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-3"
          >
            <FileText className="w-5 h-5" />
            <span>Upload Documents & Chat</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-7 py-4 rounded-xl glass-card border border-slate-700/80 hover:border-slate-500 text-slate-300 font-semibold text-base transition-all flex items-center justify-center space-x-2"
          >
            <Terminal className="w-5 h-5 text-brand-400" />
            <span>OpenAPI FastAPI Docs</span>
          </a>
        </div>
      </section>

      {/* How RAG Works Section */}
      <section className="w-full max-w-6xl px-6 py-16 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">How Retrieval-Augmented Generation Works</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">Step-by-step document processing, embedding generation, FAISS indexing, and context synthesis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-brand-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-lg mb-4">01</div>
            <h3 className="text-lg font-semibold text-white mb-2">Ingestion & Chunking</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Extract text from PDF, DOCX, or TXT and split into overlapping semantic chunks with page metadata.</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-brand-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-lg mb-4">02</div>
            <h3 className="text-lg font-semibold text-white mb-2">FAISS Vector Indexing</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Generate dense vector embeddings (all-MiniLM-L6-v2) and index them in high-speed FAISS vector storage.</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-brand-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg mb-4">03</div>
            <h3 className="text-lg font-semibold text-white mb-2">Semantic Search</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Convert user question to vector representation and retrieve Top-K most relevant document chunks.</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-brand-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">04</div>
            <h3 className="text-lg font-semibold text-white mb-2">Grounded LLM Answer</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Synthesize concise answer strictly from context and provide clickable inline page source citations.</p>
          </div>
        </div>
      </section>

      {/* Tech Stack Grid */}
      <section className="w-full max-w-6xl px-6 py-12 mx-auto">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-slate-950/80">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
                <Cpu className="w-6 h-6 text-brand-500" />
                <span>Modern Full-Stack Architecture</span>
              </h3>
              <p className="text-slate-400 text-sm max-w-lg">
                Decoupled design combining Spring Boot 3 gateway layer, Python 3.11 FastAPI AI engine, FAISS vector storage, and React TypeScript frontend.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700">Python 3.11</span>
              <span className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700">FastAPI</span>
              <span className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700">Spring Boot 3</span>
              <span className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700">LangChain</span>
              <span className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700">FAISS</span>
              <span className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700">PostgreSQL</span>
              <span className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700">React + TS</span>
              <span className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700">Docker</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
