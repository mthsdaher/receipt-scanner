import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiClientError, apiClient } from "services/apiClient";
import { UseResetPasswordControllerReturn } from "./types";

type ResetPageState = {
  email?: string;
  resetToken?: string;
};

export const useResetPasswordController = (): UseResetPasswordControllerReturn => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as ResetPageState | null) ?? null;

  const [email, setEmail] = useState(state?.email ?? "");
  const [resetToken, setResetToken] = useState(state?.resetToken ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange =
    (field: "email" | "resetToken" | "newPassword") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (field === "email") setEmail(value);
      if (field === "resetToken") setResetToken(value);
      if (field === "newPassword") setNewPassword(value);
    };

  const handleSubmit = async () => {
    setError("");
    setSuccessMessage("");

    try {
      await apiClient.post("/api/v1/users/reset-password", {
        email,
        resetToken,
        newPassword,
      });
      setSuccessMessage("Password reset successfully. Redirecting to Sign In...");
      setTimeout(() => navigate("/signin"), 1200);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 429) {
        setError("Too many reset attempts. Please wait and try again.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to reset password.");
      }
    }
  };

  return {
    email,
    resetToken,
    newPassword,
    error,
    successMessage,
    handleChange,
    handleSubmit,
  };
};
