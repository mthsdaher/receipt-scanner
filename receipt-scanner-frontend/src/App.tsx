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

const App: React.FC = () => (
  <>
    <Navbar />
    <Routes>
    <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-code" element={<VerificationCode />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/historic" element={<div>Historic Page (To Be Implemented)</div>} />
        <Route path="/insert-receipt" element={<InsertReceipt />} />
        <Route path="/signout" element={<Signout />} />
    </Routes>
  </>
);

export default App;
