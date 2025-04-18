export interface ParsedReceipt {
    company: string | null;
    address: string | null;
    subtotal: number;
    tax: number;
    total: number;
    date: string;
    time: string;
    items: string[];
  }
  