import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Signin from './pages/Signin/Signin.tsx';
import Signup from './pages/Signup/Signup.tsx';
import InsertReceipt from './pages/Insert/InsertReceipt.tsx';
import Dashboard from './pages/Dashboard/Dashboard.tsx';
import Signout from './pages/Signout/Signout.tsx';
import Home from './pages/Home/Home.tsx';
import Navbar from './components/Navbar.tsx'; 

const App = () => {
  return (
    <Router>
      <Navbar /> 
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/historic" element={<div>Historic Page (To Be Implemented)</div>} />
        <Route path="/insert-receipt" element={<InsertReceipt />} />
        <Route path="/signout" element={<Signout />} />
      </Routes>
    </Router>
  );
};

export default App;
