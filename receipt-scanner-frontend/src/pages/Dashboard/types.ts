export interface Receipt {
  id: string;
  userId: string;
  amount: number;
  date: string;
  description: string;
  category?: string;
}
  