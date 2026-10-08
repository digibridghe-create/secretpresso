import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined') {
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (typeof args[0] === 'string' && (args[0].includes('GrpcConnection') || args[0].includes('Disconnecting idle stream'))) {
      return;
    }
    originalConsoleWarn(...args);
  };
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && (args[0].includes('GrpcConnection') || args[0].includes('Disconnecting idle stream'))) {
      return;
    }
    originalConsoleError(...args);
  };
}

createRoot(document.getElementById('root')!).render(
  <App />
);
