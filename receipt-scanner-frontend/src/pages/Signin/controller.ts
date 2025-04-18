// Handles form state, API request and redirect after login

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// This custom hook encapsulates all logic for the Signin component
export const useSigninController = () => {
  // State variables to track input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate(); // Enables redirecting the user after successful login

  // Handles input change dynamically for email or password
  const handleChange = (field: 'email' | 'password') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (field === 'email') setEmail(e.target.value);
    else setPassword(e.target.value);
  };

  // Submits the form to the backend for authentication
  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save JWT token to localStorage
        localStorage.setItem('token', data.token);

        // Redirect user to the dashboard
        navigate('/dashboard');
      } else {
        // Show server-provided error or generic one
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong while trying to sign in.');
    }
  };

  return {
    email,
    password,
    error,
    handleChange,
    handleSubmit,
  };
};
