import React from 'react';
import { Route, Routes } from 'react-router-dom';

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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/historic" element={<History />} />
        <Route path="/insert-receipt" element={<InsertReceipt />} />
        <Route path="/signout" element={<Signout />} />
      </Routes>
    </div>
  </>
);

export default App;
