import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UseSigninControllerReturn } from './types';
import { useAuth } from 'contexts/AuthContext';
import { apiClient } from 'services/apiClient';

interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

export const useSigninController = (): UseSigninControllerReturn => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // countdown state for "Resend Code" button
  const [timer, setTimer] = useState(0);
  const [allowResend, setAllowResend] = useState(true);

  const navigate = useNavigate();
  const { signIn } = useAuth();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && !allowResend) {
      setAllowResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, allowResend]);

  const formattedTimer = useMemo(() => {
    const m = Math.floor(timer / 60).toString().padStart(2, '0');
    const s = (timer % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [timer]);

  const handleChange = (field: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (field === 'email') setEmail(e.target.value);
    else setPassword(e.target.value);
  };

  const handleSubmit = async () => {
    setError('');
    try {
      const response = await apiClient.post<ApiSuccessResponse<{ token: string }>>('/api/users/login', {
        email,
        password,
      });
      signIn(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while trying to sign in.');
    }
  };

  const handleResend = async () => {
    setError('');
    setAllowResend(false);
    setTimer(300);

    try {
      await apiClient.post('/api/users/resend-code', { email });
      navigate('/verify-code', { state: { email } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while resending code.');
    }
  };

  const goToForgotPassword = () => {
    navigate('/forgot-password');
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
    goToForgotPassword,
  };
};