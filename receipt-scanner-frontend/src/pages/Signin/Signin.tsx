import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Layout from '../../components/Layout.tsx';

const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const Signin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = signinSchema.safeParse({ email, password });

    if (!result.success) {
      result.error.errors.forEach((error) => toast.error(error.message));
      return;
    }

    try {
      const response = await axios.post('http://localhost:3002/api/users/login', {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      toast.success('You are logged in!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error during login');
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign In</h2>
        <form onSubmit={handleSignin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition duration-300"
          >
            Enter
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </Layout>
  );
};

export default Signin;
