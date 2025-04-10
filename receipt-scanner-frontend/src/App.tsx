import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signin from './pages/Signin/Signin.tsx';
import Signup from './pages/Signup/Signup.tsx';
import Dashboard from './pages/Dashboard/Dashboard.tsx';
import Signout from './pages/Signout/Signout.tsx';
import Home from './pages/Home/Home.tsx';

// Main application component
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to Home */}
        <Route path="/" element={<Home />} />
        {/* Sign-in route */}
        <Route path="/signin" element={<Signin />} />
        {/* Sign-up route */}
        <Route path="/signup" element={<Signup />} />
        {/* Dashboard route */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Historic route (placeholder for now) */}
        <Route path="/historic" element={<div>Historic Page (To Be Implemented)</div>} />
        {/* Insert Receipt route (placeholder for now) */}
        <Route path="/insert-receipt" element={<div>Insert Receipt Page (To Be Implemented)</div>} />
        {/* Sign-out route */}
        <Route path="/signout" element={<Signout />} />
      </Routes>
    </Router>
  );
};

export default App;