import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UseVerificationControllerReturn } from './types';
import { ApiClientError, apiClient } from 'services/apiClient';

interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

export const useVerificationController = (): UseVerificationControllerReturn => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  // retrieve email and optionally verificationCode (returned by API when no email sending)
  const email = (location.state as any)?.email as string;
  const initialCode = (location.state as any)?.verificationCode as string | undefined;

  // if no email, go back to signup
  useEffect(() => {
    if (!email) navigate('/signup', { replace: true });
  }, [email, navigate]);

  const [codeInput, setCodeInput] = useState(initialCode ?? '');
  const [verifyError, setVerifyError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // countdown for expiration / resend
  const [timer, setTimer] = useState(300);
  useEffect(() => {
    if (timer > 0) {
      const id = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(id);
    }
  }, [timer]);

  // format MM:SS
  const formattedTimer = useMemo(() => {
    const m = Math.floor(timer / 60).toString().padStart(2, '0');
    const s = (timer % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [timer]);

  const handleResend = async () => {
    setVerifyError('');
    try {
      const response = await apiClient.post<ApiSuccessResponse<{ verificationCode?: string }>>(
        '/api/v1/users/resend-code',
        { email }
      );
      setTimer(300);
      if (response.data.verificationCode) setCodeInput(response.data.verificationCode);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 429) {
        setVerifyError('Too many resend attempts. Please wait and try again.');
      } else {
        setVerifyError(err instanceof Error ? err.message : 'Something went wrong');
      }
    }
  };

  const handleVerify = async () => {
    setVerifyError('');
    setIsVerifying(true);
    try {
      const response = await apiClient.post<ApiSuccessResponse<{ token: string }>>('/api/v1/users/validate-code', {
        email,
        code: codeInput,
      });
      signIn(response.data.token);
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 429) {
        setVerifyError('Too many verification attempts. Please wait and try again.');
      } else {
        setVerifyError(err instanceof Error ? err.message : 'Invalid code');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    email,
    codeInput,
    setCodeInput,
    verifyError,
    isVerifying,
    formattedTimer,
    handleResend,
    handleVerify,
  };
};