import React, { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

// Signout component to handle user logout
const Signout = () => {
  // Access signOut from auth context
  const { signOut } = useAuth();

  // Effect to handle sign-out logic when the component mounts
  useEffect(() => {
    // Clear the authentication token from localStorage
    localStorage.removeItem("token");
    // Call signOut from auth context
    signOut();
  }, [signOut]);

  // Render a simple message (user will be redirected immediately)
  return (
    <div>
      <h2>Signing Out</h2>
      <p>You are being signed out. Redirecting to login...</p>
    </div>
  );
};

export default Signout;
