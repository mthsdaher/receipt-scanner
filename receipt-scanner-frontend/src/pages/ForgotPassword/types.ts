export interface UseForgotPasswordControllerReturn {
  email: string;
  resetToken: string;
  error: string;
  successMessage: string;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => Promise<void>;
  goToResetPassword: () => void;
}
