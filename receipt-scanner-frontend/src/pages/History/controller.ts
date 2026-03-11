import { useCallback, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "contexts/AuthContext";
import { apiClient } from "services/apiClient";
import {
  DecodedTokenPayload,
  ReceiptHistoryItem,
  SortOption,
  UseHistoryControllerReturn,
} from "./types";

/**
 * History controller:
 * - Reads the JWT from localStorage
 * - Decodes it to extract the authenticated user id
 * - Fetches receipts from the backend
 * - Exposes sorted receipts according to selected sort option
 */
export const useHistoryController = (): UseHistoryControllerReturn => {
  const { signOut } = useAuth();
  const [rawReceipts, setRawReceipts] = useState<ReceiptHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("date");

  /**
   * Safely extracts the user id from JWT payload.
   * Returns null if token is missing/invalid.
   */
  const getUserIdFromToken = useCallback((): string | null => {
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }

    try {
      const decoded = jwtDecode<DecodedTokenPayload>(token);
      return decoded.id ?? null;
    } catch (decodeError) {
      console.error("Failed to decode JWT token:", decodeError);
      return null;
    }
  }, []);

  const refreshReceipts = useCallback(async () => {
    setLoading(true);
    setError("");

    const userId = getUserIdFromToken();
    if (!userId) {
      setError("User session is invalid. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      const data = await apiClient.get<ReceiptHistoryItem[]>(
        `/api/receipts/${userId}`,
        signOut
      );
      setRawReceipts(data);
    } catch (fetchError) {
      console.error("Failed to load receipt history:", fetchError);
      setError("Could not load receipt history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [getUserIdFromToken, signOut]);

  useEffect(() => {
    void refreshReceipts();
  }, [refreshReceipts]);

  /**
   * Applies dynamic sorting in-memory whenever data or selected option changes.
   * Default order for date/value is descending to prioritize newest/largest receipts.
   */
  const receipts = useMemo(() => {
    const items = [...rawReceipts];

    if (sortBy === "value") {
      return items.sort((a, b) => {
        const aValue = a.totalValue ?? a.amount ?? 0;
        const bValue = b.totalValue ?? b.amount ?? 0;
        return bValue - aValue;
      });
    }

    if (sortBy === "description") {
      return items.sort((a, b) =>
        (a.description ?? "").localeCompare(b.description ?? "", undefined, {
          sensitivity: "base",
        })
      );
    }

    return items.sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();
      return bTime - aTime;
    });
  }, [rawReceipts, sortBy]);

  return {
    receipts,
    loading,
    error,
    sortBy,
    setSortBy,
    refreshReceipts,
  };
};
