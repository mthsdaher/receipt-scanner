import React from 'react';
import ReactDOM from 'react-dom/client';                
import { BrowserRouter } from 'react-router-dom';        
import './index.css';
import App from './App';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';

const container = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(container);           

root.render(                                      
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <ToastContainer />                            
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
