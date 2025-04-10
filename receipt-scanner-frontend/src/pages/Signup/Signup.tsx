import React, { useState } from 'react';
import axios from 'axios';
import { z } from 'zod';
import Layout from '../../components/Layout.tsx';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
const cellNumberRegex = /^\d+$/;

const signupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  age: z.string().refine((val) => !isNaN(Number(val)), 'Age must be a number'),
  email: z.string().email('Valid email is required'),
  cellNumber: z.string().regex(cellNumberRegex, 'Cell number must contain only digits'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordRegex, 'Password must contain uppercase, lowercase, number and special character (!@#$%^&*)'),
});

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    email: '',
    cellNumber: '',
    password: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signupSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        newErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(newErrors);
    } else {
      setErrors({});
      try {
        const response = await axios.post('http://localhost:3002/api/users/signup', {
          fullName: formData.fullName,
          age: Number(formData.age),
          email: formData.email,
          cellNumber: formData.cellNumber,
          password: formData.password,
        });

        console.log('✅ User created:', response.data);
        alert('Check your email or use the code to activate your account.');
      } catch (error: any) {
        console.error('❌ Error creating user:', error.response?.data || error.message);
        alert('Error: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto bg-black text-white p-8 space-y-6 font-mono border-4 border-red-500">
        <h1 className="text-4xl font-bold uppercase tracking-widest text-red-500 text-center">
          Sign Up
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="fullName"
            placeholder="FULL NAME"
            className="bg-white text-black p-3 text-lg uppercase tracking-wide border-2 border-black"
            value={formData.fullName}
            onChange={handleChange}
          />
          {errors.fullName && <p className="text-red-400 text-sm">{errors.fullName}</p>}

          <input
            name="age"
            placeholder="AGE"
            className="bg-white text-black p-3 text-lg uppercase tracking-wide border-2 border-black"
            value={formData.age}
            onChange={handleChange}
          />
          {errors.age && <p className="text-red-400 text-sm">{errors.age}</p>}

          <input
            name="email"
            type="email"
            placeholder="EMAIL"
            className="bg-white text-black p-3 text-lg uppercase tracking-wide border-2 border-black"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}

          <input
            name="cellNumber"
            placeholder="PHONE (DIGITS ONLY)"
            className="bg-white text-black p-3 text-lg uppercase tracking-wide border-2 border-black"
            value={formData.cellNumber}
            onChange={handleChange}
          />
          {errors.cellNumber && <p className="text-red-400 text-sm">{errors.cellNumber}</p>}

          <input
            name="password"
            type="password"
            placeholder="PASSWORD"
            className="bg-white text-black p-3 text-lg uppercase tracking-wide border-2 border-black"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}

          <button
            type="submit"
            className="bg-red-600 hover:bg-red-800 text-white py-3 uppercase text-lg tracking-widest border-2 border-white transition"
          >
            CREATE ACCOUNT
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Signup;
