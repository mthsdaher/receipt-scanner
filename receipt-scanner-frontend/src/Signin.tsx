import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

// Define the schema for sign-in form data
const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const Signin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Handle form submission with validation and API call
  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate form data using Zod schema
      const result = signinSchema.safeParse({ email, password });
      if (!result.success) {
        // Display validation errors via toast notifications
        result.error.errors.forEach((error) => {
          toast.error(error.message);
        });
        return;
      }

      // Make API call to login endpoint if validation passes
      const response = await axios.post('http://localhost:3002/api/users/login', {
        email,
        password,
      });
      // Store token in localStorage for authentication
      localStorage.setItem('token', response.data.token);
      toast.success('You are logged in!');
      // Redirect to dashboard on successful login
      navigate('/dashboard');
    } catch (error: any) {
      // Handle API errors or unexpected issues
      toast.error(error.response?.data?.message || 'Error during login');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSignin}>
        {/* Email input field */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {/* Password input field */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {/* Submit button */}
        <button type="submit">Enter</button>
      </form>
      {/* Toast container for displaying notifications */}
      <ToastContainer />
    </div>
  );
};

export default Signin;