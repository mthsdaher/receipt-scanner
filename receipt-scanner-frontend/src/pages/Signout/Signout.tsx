import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Signout component to handle user logout
const Signout: React.FC = () => {
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Effect to handle sign-out logic when the component mounts
  useEffect(() => {
    // Clear the authentication token from localStorage
    localStorage.removeItem('token');
    // Redirect the user to the sign-in page
    navigate('/signin');
  }, [navigate]); // Dependency array includes navigate to avoid warnings

  // Render a simple message (user will be redirected immediately)
  return (
    <div>
      <h2>Signing Out</h2>
      <p>You are being signed out. Redirecting to login...</p>
    </div>
  );
};

export default Signout;