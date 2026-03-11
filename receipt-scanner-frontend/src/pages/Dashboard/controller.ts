import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAuthUserId } from "../../hooks/useAuthUserId";
import { apiClient } from "../../services/apiClient";
import { Receipt } from "./types";

export const useDashboardController = () => {
  const { signOut } = useAuth();
  const userId = useAuthUserId();
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const fetchReceipts = async () => {
    if (!userId) return;
    try {
      const data = await apiClient.get<Receipt[]>(
        `/api/receipts/${userId}`,
        signOut
      );
      setReceipts(data);
    } catch (err) {
      console.error("Failed to fetch receipts:", err);
    }
  };

  useEffect(() => {
    if (userId) fetchReceipts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { receipts, fetchReceipts };
};
