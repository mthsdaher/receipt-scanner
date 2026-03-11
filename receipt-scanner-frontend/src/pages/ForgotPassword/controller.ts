import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "services/apiClient";
import { UseForgotPasswordControllerReturn } from "./types";

export const useForgotPasswordController = (): UseForgotPasswordControllerReturn => {
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async () => {
    setError("");
    setSuccessMessage("");
    setResetToken("");

    try {
      const data = await apiClient.post<{ message: string; resetToken?: string }>(
        "/api/users/reset-request",
        { email }
      );
      setSuccessMessage(data.message ?? "Reset instructions generated successfully.");
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request password reset.");
    }
  };

  const goToResetPassword = () => {
    navigate("/reset-password", { state: { email, resetToken } });
  };

  return {
    email,
    resetToken,
    error,
    successMessage,
    handleEmailChange,
    handleSubmit,
    goToResetPassword,
  };
};
