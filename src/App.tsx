import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppRouter } from './routers/AppRouter';
import AiChatbot from './components/common/AiChatbot';

import { BrowserRouter } from 'react-router-dom';
import { useDataSync } from './hooks/useDataSync';

function DataSyncWrapper() {
  useDataSync();
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRouter />
          <AiChatbot />
          <DataSyncWrapper />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;