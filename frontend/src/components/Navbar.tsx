import React from 'react';
import { Brain, FileText, MessageSquare, ShieldCheck, Activity, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openAuthModal }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Brand Logo */}
      <div 
        onClick={() => setActiveTab('landing')}
        className="flex items-center space-x-3 cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all duration-300">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Brain className="w-5 h-5 text-brand-500 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <div>
          <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
            DocuMind <span className="text-brand-500 font-extrabold">AI</span>
          </span>
          <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Enterprise RAG Engine</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="hidden md:flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('landing')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'landing' 
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'documents' 
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Documents</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'chat' 
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>RAG Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab('debug')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'debug' 
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>RAG Debug</span>
        </button>

        <button
          onClick={() => setActiveTab('eval')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'eval' 
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Evaluation</span>
        </button>
      </div>

      {/* Auth Actions */}
      <div className="flex items-center space-x-3">
        {isAuthenticated ? (
          <div className="flex items-center space-x-3 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-semibold text-xs">
                {user?.username?.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-200 hidden sm:inline">{user?.username}</span>
            </div>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white text-sm font-medium shadow-lg shadow-brand-600/25 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
};
