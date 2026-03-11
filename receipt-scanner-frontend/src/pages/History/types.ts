export type SortOption = "date" | "value" | "description";

export interface ReceiptHistoryItem {
  id: string;
  userId: string;
  amount: number;
  totalValue?: number;
  description: string;
  date: string;
  category?: string;
}

export interface DecodedTokenPayload {
  id?: string;
  email?: string;
  exp?: number;
  iat?: number;
}

export interface UseHistoryControllerReturn {
  receipts: ReceiptHistoryItem[];
  loading: boolean;
  error: string;
  sortBy: SortOption;
  setSortBy: (value: SortOption) => void;
  refreshReceipts: () => Promise<void>;
}
