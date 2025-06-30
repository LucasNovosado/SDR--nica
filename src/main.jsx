import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Registro do Service Worker do PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      registration => {
        console.log('Service Worker registrado com sucesso:', registration);
      },
      err => {
        console.warn('Falha ao registrar o Service Worker:', err);
      }
    );
  });
} else {
  console.log('PWA não suportado neste navegador.');
}