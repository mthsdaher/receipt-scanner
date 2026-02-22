import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignupFormFields, SignupControllerReturn } from "./types";
import { buildApiUrl } from "services/api";

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
      const res = await fetch(buildApiUrl("/api/users/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        // Pass email via state to the verify page
        navigate("/verify-code", { state: { email: form.email } });
      } else {
        setError(data.message || "Signup failed");
      }
    } catch {
      setError("Something went wrong");
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
  };
};
