import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DataProvider } from './application/providers/DataProvider';
import { AuthProvider } from './application/providers/AuthProvider';
import { ToastProvider } from './application/providers/ToastProvider';
import './infrastructure/css/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <DataProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </DataProvider>
    </ToastProvider>
  </React.StrictMode>
);