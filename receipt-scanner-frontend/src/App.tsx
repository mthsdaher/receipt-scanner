import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Signin from './pages/Signin';
import Signup from './pages/Signup';
import InsertReceipt from './pages/Insert';
import Dashboard from './pages/Dashboard';
import Signout from './pages/Signout/Signout';
import Home from './pages/Home';
import Navbar from './components/Navbar'; 
import VerificationCode from "./pages/VerificationCode";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import History from "./pages/History";
import AiChat from "./pages/AiChat";
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  return children;
};

const App: React.FC = () => (
  <>
    <Navbar />
    <div
      style={{
        paddingTop: '64px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-code" element={<VerificationCode />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/historic"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insert-receipt"
          element={
            <ProtectedRoute>
              <InsertReceipt />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <AiChat />
            </ProtectedRoute>
          }
        />
        <Route path="/signout" element={<Signout />} />
      </Routes>
    </div>
  </>
);

export default App;
