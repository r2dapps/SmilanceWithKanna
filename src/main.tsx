import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(err => {
      console.error('Service Worker registration failed: ', err);
    });
  });
}

// Force a one-time cache clear for the fresh review request
if (!localStorage.getItem('fresh_start_2026_06_10')) {
  localStorage.clear();
  localStorage.setItem('fresh_start_2026_06_10', 'true');
  window.location.reload();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
