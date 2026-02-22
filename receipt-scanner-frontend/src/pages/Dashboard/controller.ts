import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "contexts/AuthContext";
import { Receipt } from "./types";
import { buildApiUrl } from "services/api";

export const useDashboardController = () => {
  const { signOut } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const fetchReceipts = async () => {
    const token = localStorage.getItem("token");
    let userId: string | null = null;

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        userId = decoded?.id || null;
      } catch (err) {
        console.error("Failed to decode token:", err);
        signOut();
        return;
      }
    }
    try {
      const response = await fetch(
        buildApiUrl(`/api/receipts/${userId}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setReceipts(data);
    } catch (err) {
      console.error("Failed to fetch receipts:", err);
    }
  };

  return { receipts, fetchReceipts };
};
