import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DocumentDashboard } from './components/DocumentDashboard';
import { RAGChat } from './components/RAGChat';
import { RAGDebugInspector } from './components/RAGDebugInspector';
import { EvaluationDashboard } from './components/EvaluationDashboard';
import { AuthModal } from './components/AuthModal';
import { AuthProvider } from './context/AuthContext';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAuthModal={() => setAuthModalOpen(true)}
      />

      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage onStart={() => setActiveTab('documents')} />
        )}
        {activeTab === 'documents' && (
          <DocumentDashboard />
        )}
        {activeTab === 'chat' && (
          <RAGChat />
        )}
        {activeTab === 'debug' && (
          <RAGDebugInspector />
        )}
        {activeTab === 'eval' && (
          <EvaluationDashboard />
        )}
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
