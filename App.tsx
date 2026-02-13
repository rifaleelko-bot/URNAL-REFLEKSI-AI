import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { JournalProvider, useJournal } from './contexts/JournalContext';
import AuthForm from './components/AuthForm';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import SetupGuide from './components/SetupGuide';

const Dashboard: React.FC = () => {
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isSetupRequired } = useJournal();

  if (isSetupRequired) {
    return <SetupGuide />;
  }

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
        onSelectEntry={setCurrentEntryId}
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