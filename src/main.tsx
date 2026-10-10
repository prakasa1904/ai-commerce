import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DataProvider } from './application/providers/DataProvider';
import { CartProvider } from './application/providers/CartProvider';
import { AuthProvider } from './application/providers/AuthProvider';
import { ToastProvider } from './application/providers/ToastProvider';
import './infrastructure/css/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <DataProvider>
        <CartProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </CartProvider>
      </DataProvider>
    </ToastProvider>
  </React.StrictMode>
);