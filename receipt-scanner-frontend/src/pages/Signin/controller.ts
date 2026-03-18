import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UseSigninControllerReturn } from './types';
import { useAuth } from 'contexts/AuthContext';
import { ApiClientError, apiClient } from 'services/apiClient';
import { frontendEnv } from 'config/env';

interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_not_configured: 'Google sign-in is not configured. Please use email/password.',
  oauth_denied: 'Google sign-in was cancelled.',
  oauth_invalid: 'Invalid Google sign-in response. Please try again.',
  oauth_no_email: 'Could not get email from Google. Please try another method.',
  oauth_failed: 'Google sign-in failed. Please try again.',
};

export const useSigninController = (): UseSigninControllerReturn => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // countdown state for "Resend Code" button
  const [timer, setTimer] = useState(0);
  const [allowResend, setAllowResend] = useState(true);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { signIn } = useAuth();

  const [oauthLoading, setOauthLoading] = useState(false);

  // Handle OAuth callback: token or error in URL
  useEffect(() => {
    const token = searchParams.get('token');
    const err = searchParams.get('error');
    if (token) {
      setOauthLoading(true);
      signIn(token);
      setSearchParams({}, { replace: true });
      navigate('/dashboard', { replace: true });
      return;
    }
    if (err && OAUTH_ERROR_MESSAGES[err]) {
      setError(OAUTH_ERROR_MESSAGES[err]);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, signIn, navigate, setSearchParams]);

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
    setError('');
    if (field === 'email') setEmail(e.target.value);
    else setPassword(e.target.value);
  };

  const handleSubmit = async () => {
    setError('');
    try {
      const response = await apiClient.post<ApiSuccessResponse<{ token: string }>>('/api/v1/users/login', {
        email,
        password,
      });
      signIn(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 429) {
        setError('Too many sign-in attempts. Please wait and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong while trying to sign in.');
      }
    }
  };

  const handleResend = async () => {
    setError('');
    setAllowResend(false);
    setTimer(300);

    try {
      await apiClient.post('/api/v1/users/resend-code', { email });
      navigate('/verify-code', { state: { email } });
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 429) {
        setError('Too many resend attempts. Please wait and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong while resending code.');
      }
    }
  };

  const goToForgotPassword = () => {
    navigate('/forgot-password');
  };

  const googleSignInUrl = `${frontendEnv.API_URL}/api/v1/auth/google`;

  return {
    email,
    password,
    error,
    oauthLoading,
    allowResend,
    formattedTimer,
    handleChange,
    handleSubmit,
    handleResend,
    goToForgotPassword,
    googleSignInUrl,
  };
};