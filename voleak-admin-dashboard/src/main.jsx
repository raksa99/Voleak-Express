import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

window.addEventListener('error', (e) => {
  console.error('[Global App Error]', e.error || e.message);
});

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
  } catch (err) {
    console.error('Fatal mount error', err);
    rootElement.innerHTML = `
      <div style="padding: 30px; font-family: sans-serif; background: #0f172a; color: white; min-height: 100vh;">
        <h2 style="color: #f59e0b;">Voleak Express Dashboard Mount Notice</h2>
        <pre style="background: #1e293b; padding: 16px; border-radius: 8px; color: #f87171;">${err?.stack || err?.message || err}</pre>
      </div>
    `;
  }
}
