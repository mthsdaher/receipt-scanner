import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignupFormFields, SignupControllerReturn } from "./types";
import { apiClient } from "services/apiClient";
import { frontendEnv } from "config/env";

interface ApiSuccessResponse<T> {
  status: "success";
  data: T;
}

/**
 * Manages only the signup form and redirects to /verify-code on success.
 */
export const useSignupController = (): SignupControllerReturn => {
  const [form, setForm] = useState<SignupFormFields>({
    fullName: "",
    age: "",
    email: "",
    cellNumber: "",
    password: "",
  });
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  /** Update a given form field */
  const handleChange = (field: keyof SignupFormFields) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  /**
   * Send signup request.
   * On success, redirect to the verification page.
   */
  const handleSubmit = async () => {
    setError("");
    try {
      const response = await apiClient.post<
        ApiSuccessResponse<{
          verificationCode?: string;
        }>
      >("/api/v1/users/signup", form);
      // Pass email and code via state to verify page (code only in dev when no email sending)
      navigate("/verify-code", {
        state: { email: form.email, verificationCode: response.data.verificationCode },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return {
    fullName: form.fullName,
    age: form.age,
    email: form.email,
    cellNumber: form.cellNumber,
    password: form.password,
    error,
    handleChange,
    handleSubmit,
    googleSignUpUrl: `${frontendEnv.API_URL}/api/v1/auth/google`,
  };
};
