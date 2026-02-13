import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { JournalProvider } from './contexts/JournalContext';
import AuthForm from './components/AuthForm';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';

const Dashboard: React.FC = () => {
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar 
        currentEntryId={currentEntryId} 
        onSelectEntry={setCurrentEntryId}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <Editor 
        entryId={currentEntryId} 
        onMenuClick={() => setIsSidebarOpen(true)}
      />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? (
    <JournalProvider>
      <Dashboard />
    </JournalProvider>
  ) : (
    <AuthForm />
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;