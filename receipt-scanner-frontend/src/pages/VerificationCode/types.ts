export interface UseVerificationControllerReturn {
    email: string;
    codeInput: string;
    setCodeInput: React.Dispatch<React.SetStateAction<string>>;
    verifyError: string;
    isVerifying: boolean;
    formattedTimer: string;
    handleResend: () => Promise<void>;
    handleVerify: () => Promise<void>;
  }
  