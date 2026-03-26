import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'

const theme = createTheme({
  palette: {
    primary: { main: '#2563eb', light: '#60a5fa', dark: '#1d4ed8' },
    secondary: { main: '#64748b', light: '#94a3b8', dark: '#475569' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#64748b' }
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 900, letterSpacing: -1.5 },
    h4: { fontWeight: 900, letterSpacing: -1 },
    h6: { fontWeight: 800 },
    button: { textTransform: 'none', fontWeight: 700 }
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 12, padding: '10px 20px' } } },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 16 } } },
    MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 12 } } } }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
        },
        success: {
          iconTheme: {
            primary: '#22c55e',
            secondary: '#1e293b',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#1e293b',
          },
        },
      }}
    />
  </React.StrictMode>,
)
