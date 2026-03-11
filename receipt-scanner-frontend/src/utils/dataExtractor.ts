// Shared type representing a parsed receipt returned by the backend
export interface ParsedReceipt {
  store: string;
  total: number;
  date: string;
}
