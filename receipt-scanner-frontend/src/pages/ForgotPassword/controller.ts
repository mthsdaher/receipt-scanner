import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiClientError, apiClient } from "services/apiClient";
import { UseForgotPasswordControllerReturn } from "./types";

interface ApiSuccessResponse<T> {
  status: "success";
  message?: string;
  data: T;
}

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
      const response = await apiClient.post<ApiSuccessResponse<{ resetToken?: string }>>(
        "/api/users/reset-request",
        { email }
      );
      setSuccessMessage(response.message ?? "Reset instructions generated successfully.");
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
      }
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 429) {
        setError("Too many reset requests. Please wait and try again.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to request password reset.");
      }
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
