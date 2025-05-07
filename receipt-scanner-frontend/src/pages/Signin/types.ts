export interface UseSigninControllerReturn {
  email: string;
  password: string;
  error: string;
  allowResend: boolean;
  formattedTimer: string;
  handleChange: (field: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => Promise<void>;
  handleResend: () => Promise<void>;
}