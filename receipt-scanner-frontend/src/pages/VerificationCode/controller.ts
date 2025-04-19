import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const useVerificationController = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as any)?.email as string;

  // if we don’t have an email, bounce back:
  useEffect(() => {
    if (!email) navigate("/signup", { replace: true });
  }, [email, navigate]);

  const [codeInput, setCodeInput] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(300);

  // countdown
  useEffect(() => {
    if (timer > 0) {
      const id = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(id);
    }
  }, [timer]);

  const formattedTimer = useMemo(() => {
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  }, [timer]);

  // resend
  const handleResend = async () => {
    setVerifyError("");
    try {
      const res = await fetch("http://localhost:3002/api/users/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) setTimer(300);
      else setVerifyError(data.message || "Could not resend code");
    } catch {
      setVerifyError("Something went wrong");
    }
  };

  // verify + navigate home
  const handleVerify = async () => {
    setVerifyError("");
    setIsVerifying(true);
    try {
      const res = await fetch(
        "http://localhost:3002/api/users/validate-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: codeInput }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        navigate("/", { replace: true });
      } else {
        setVerifyError(data.message || "Invalid code");
      }
    } catch {
      setVerifyError("Something went wrong");
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
