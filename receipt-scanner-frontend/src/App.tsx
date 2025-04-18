import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Signin from './pages/Signin';
import Signup from './pages/Signup';
import InsertReceipt from './pages/Insert';
import Dashboard from './pages/Dashboard';
import Signout from './pages/Signout/Signout';
import Home from './pages/Home';
import Navbar from './components/Navbar'; 

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
