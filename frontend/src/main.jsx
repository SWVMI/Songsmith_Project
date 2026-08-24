import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-center" toastOptions={{
          style: { background: '#18181b', color: '#f4f4f5', border: '1px solid #3f3f46', fontFamily: 'monospace', fontSize: '12px' },
        }} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
