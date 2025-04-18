import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupFormFields } from './types';

export const useSignupController = () => {
  const [form, setForm] = useState<SignupFormFields>({
    fullName: '',
    age: '',
    email: '',
    cellNumber: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (field: keyof SignupFormFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/signin');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    }
  };

  return {
    ...form,
    error,
    handleChange,
    handleSubmit
  };
};
