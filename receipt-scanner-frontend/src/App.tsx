import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./Signup.tsx";
import Signin from "./Signin.tsx";
import Signout from "./pages/Signout/Signout.tsx";
import Dashboard from "./Dashboard.tsx";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signout" element={<Signout />} />
      </Routes>
    </Router>
  );
};

export default App;
