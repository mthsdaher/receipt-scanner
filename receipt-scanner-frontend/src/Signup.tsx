import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cellNumber, setCellNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3002/api/users/signup', {
        fullName,
        email,
        cellNumber,
        password,
      });
      toast.success(response.data.message || 'Signed up!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error on sign up :(');
    }
  };

  return (
    <div>
      <h2>Cadastro</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Cellphone Number"
          value={cellNumber}
          onChange={(e) => setCellNumber(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Signup;