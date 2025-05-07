import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UseVerificationControllerReturn } from './types';

export const useVerificationController = (): UseVerificationControllerReturn => {
  const location = useLocation();
  const navigate = useNavigate();

  // retrieve email passed via state
  const email = (location.state as any)?.email as string;

  // if no email, go back to signup
  useEffect(() => {
    if (!email) navigate('/signup', { replace: true });
  }, [email, navigate]);

  const [codeInput, setCodeInput] = useState('');
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

  // resend code
  const handleResend = async () => {
    setVerifyError('');
    try {
      const res = await fetch('http://localhost:3002/api/users/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) setTimer(300);
      else setVerifyError(data.message || 'Could not resend code');
    } catch {
      setVerifyError('Something went wrong');
    }
  };

  // verify code
  const handleVerify = async () => {
    setVerifyError('');
    setIsVerifying(true);
    try {
      const res = await fetch('http://localhost:3002/api/users/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: codeInput }),
      });
      const data = await res.json();
      if (res.ok) {
        // assume backend returns a fresh token on verify
        localStorage.setItem('token', data.token);
        navigate('/', { replace: true });
      } else {
        setVerifyError(data.message || 'Invalid code');
      }
    } catch {
      setVerifyError('Something went wrong');
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