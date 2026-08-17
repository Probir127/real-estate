import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0f2040',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#d4a853', secondary: '#0f2040' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#0f2040' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
