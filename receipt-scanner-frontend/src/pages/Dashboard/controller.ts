import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient } from "../../services/apiClient";
import {
  CategoryDistributionPoint,
  DashboardStats,
  DecodedTokenPayload,
  MonthlySpendingPoint,
  Receipt,
  SpendingOverTimePoint,
  TopPurchasePoint,
  UseDashboardControllerReturn,
} from "./types";

/**
 * Converts backend receipt payloads into a normalized numeric value.
 * Some environments may send amount while others may expose totalValue.
 */
const getReceiptValue = (receipt: Receipt): number => {
  const value = receipt.totalValue ?? receipt.amount ?? 0;
  return Number.isFinite(value) ? Number(value) : 0;
};

/**
 * Formats a Date object into YYYY-MM-DD to guarantee stable grouping keys.
 */
const formatDateKey = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toISOString().split("T")[0];
};

export const useDashboardController = (): UseDashboardControllerReturn => {
  const { signOut } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  /**
   * Reads JWT from localStorage and extracts the user id from its payload.
   */
  const getUserIdFromToken = (): string | null => {
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
  };

  const fetchReceipts = async () => {
    const userId = getUserIdFromToken();
    if (!userId) {
      setError("User session is invalid. Please sign in again.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await apiClient.get<Receipt[]>(
        `/api/receipts/${userId}`,
        signOut
      );
      setReceipts(data);
    } catch (err) {
      console.error("Failed to fetch receipts:", err);
      setError("Could not load financial analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReceipts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Computes KPI cards shown in the top section.
   */
  const stats = useMemo<DashboardStats>(() => {
    const values = receipts.map(getReceiptValue);
    const totalReceipts = receipts.length;
    const totalSpent = values.reduce((sum, current) => sum + current, 0);
    const averageReceiptValue =
      totalReceipts > 0 ? totalSpent / totalReceipts : 0;
    const highestReceiptValue = values.length > 0 ? Math.max(...values) : 0;

    return {
      totalReceipts,
      totalSpent,
      averageReceiptValue,
      highestReceiptValue,
    };
  }, [receipts]);

  /**
   * Aggregates spending by exact day for trend evolution.
   */
  const spendingOverTime = useMemo<SpendingOverTimePoint[]>(() => {
    const grouped = new Map<string, number>();

    receipts.forEach((receipt) => {
      const key = formatDateKey(receipt.date);
      const current = grouped.get(key) ?? 0;
      grouped.set(key, current + getReceiptValue(receipt));
    });

    return Array.from(grouped.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [receipts]);

  /**
   * Aggregates spending by month to expose seasonality and budget concentration.
   */
  const monthlySpending = useMemo<MonthlySpendingPoint[]>(() => {
    const grouped = new Map<string, number>();

    receipts.forEach((receipt) => {
      const parsed = new Date(receipt.date);
      if (Number.isNaN(parsed.getTime())) {
        return;
      }

      const monthKey = `${parsed.getFullYear()}-${String(
        parsed.getMonth() + 1
      ).padStart(2, "0")}`;
      grouped.set(monthKey, (grouped.get(monthKey) ?? 0) + getReceiptValue(receipt));
    });

    return Array.from(grouped.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [receipts]);

  /**
   * Aggregates spending by category for proportional distribution insights.
   */
  const categoryDistribution = useMemo<CategoryDistributionPoint[]>(() => {
    const grouped = new Map<string, number>();

    receipts.forEach((receipt) => {
      const category = receipt.category?.trim() || "Uncategorized";
      grouped.set(category, (grouped.get(category) ?? 0) + getReceiptValue(receipt));
    });

    return Array.from(grouped.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [receipts]);

  /**
   * Selects and ranks the highest-value purchases for quick anomaly spotting.
   */
  const topPurchases = useMemo<TopPurchasePoint[]>(() => {
    return receipts
      .map((receipt) => ({
        description: receipt.description || "Untitled receipt",
        total: getReceiptValue(receipt),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [receipts]);

  return {
    loading,
    error,
    stats,
    spendingOverTime,
    monthlySpending,
    categoryDistribution,
    topPurchases,
  };
};
