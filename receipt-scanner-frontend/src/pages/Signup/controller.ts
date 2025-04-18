import { useState, useEffect, useMemo } from 'react';
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
  const [codeSent, setCodeSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  const handleChange =
    (field: keyof SignupFormFields) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async () => {
    setError('');
    try {
      const res = await fetch('http://localhost:3002/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        // code sent
        setCodeSent(true);
        setTimer(300); // 300 s = 5 min
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      const res = await fetch('http://localhost:3002/api/users/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setTimer(300);
      } else {
        setError(data.message || 'Resend failed');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    }
  };

  // regressive counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (codeSent && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [codeSent, timer]);

  // format “MM:SS”
  const formattedTimer = useMemo(() => {
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [timer]);

  return {
    // form
    fullName: form.fullName,
    age: form.age,
    email: form.email,
    cellNumber: form.cellNumber,
    password: form.password,
    // UI States
    error,
    codeSent,
    timer,
    formattedTimer,
    // handlers
    handleChange,
    handleSubmit,
    handleResend,
  };
};
