import { AuthProvider } from './contexts/AuthContext';
import { AppRouter } from './routers/AppRouter';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;