export interface UseResetPasswordControllerReturn {
  email: string;
  resetToken: string;
  newPassword: string;
  error: string;
  successMessage: string;
  handleChange: (field: "email" | "resetToken" | "newPassword") => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => Promise<void>;
}
