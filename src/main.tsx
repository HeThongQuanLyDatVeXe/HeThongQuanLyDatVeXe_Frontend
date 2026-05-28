import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css';

// One-time cleanup: remove legacy sessionStorage cache entries from previous version
try {
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith('api_cache:')) {
      sessionStorage.removeItem(key);
    }
  }
} catch { /* noop */ }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
