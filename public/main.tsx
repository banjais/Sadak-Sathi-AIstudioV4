import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(() => {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'NEW_VERSION') {
        if (confirm(`New version ${event.data.version} available. Refresh now?`)) {
          window.location.reload(true);
        }
      }
    });
  });
}
