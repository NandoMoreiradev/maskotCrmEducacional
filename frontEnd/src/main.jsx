import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// import './index.css'; // CssBaseline do MUI já faz a normalização

import { AdminAuthProvider } from './contexts/AdminAuthContext.jsx';
import { SchoolAuthProvider } from './contexts/SchoolAuthContext.jsx'; // Importe o novo Provider
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AdminAuthProvider>
        <SchoolAuthProvider> {/* Envolva com o SchoolAuthProvider */}
          <App />
        </SchoolAuthProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);