import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UseSigninControllerReturn } from './types';
import { useAuth } from 'contexts/AuthContext';
import { buildApiUrl } from 'services/api';

export const useSigninController = (): UseSigninControllerReturn => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // countdown state for "Resend Code" button
  const [timer, setTimer] = useState(0);
  const [allowResend, setAllowResend] = useState(true);

  const navigate = useNavigate();
  const { signIn } = useAuth(); // useAuth hook to manage authentication state

  // countdown effect: decrement timer every second
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && !allowResend) {
      setAllowResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, allowResend]);

  // format seconds into MM:SS
  const formattedTimer = useMemo(() => {
    const m = Math.floor(timer / 60).toString().padStart(2, '0');
    const s = (timer % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [timer]);

  // handle input changes
  const handleChange = (field: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (field === 'email') setEmail(e.target.value);
    else setPassword(e.target.value);
  };

  // login submission
  const handleSubmit = async () => {
    setError('');
    try {
      const res = await fetch(buildApiUrl('/api/users/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.message === 'Account not activated') {
          setError('Account not activated. Please verify your account.');
        } else {
          setError(data.message || 'Invalid credentials');
        }
        return;
      }

      // substituído:
      // localStorage.setItem('token', data.token);
      signIn(data.token);

      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong while trying to sign in.');
    }
  };

  // resend verification code
  const handleResend = async () => {
    setError('');
    setAllowResend(false);
    setTimer(300); // 5 minutes

    try {
      const res = await fetch(buildApiUrl('/api/users/resend-code'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to resend verification code');
      } else {
        navigate('/verify-code', { state: { email } });
      }
    } catch {
      setError('Something went wrong while resending code.');
    }
  };

  return {
    email,
    password,
    error,
    allowResend,
    formattedTimer,
    handleChange,
    handleSubmit,
    handleResend,
  };
};