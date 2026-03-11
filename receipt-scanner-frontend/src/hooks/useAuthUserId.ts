import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../contexts/AuthContext";

interface JwtPayload {
  id?: string;
  sub?: string;
}

/**
 * Extracts userId from JWT in localStorage.
 * Centralizes JWT decoding logic (DRY) and provides proper typing.
 *
 * On decode failure or missing token, calls signOut and returns null.
 */
export function useAuthUserId(): string | null {
  const { signOut } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUserId(null);
      return;
    }
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const id = decoded?.id ?? decoded?.sub ?? null;
      setUserId(id);
    } catch {
      signOut();
      setUserId(null);
    }
  }, [signOut]);

  return userId;
}
