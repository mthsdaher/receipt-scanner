export interface Receipt {
  id: string;
  userId: string;
  amount: number;
  totalValue?: number;
  description: string;
  date: string;
  category?: string;
}

export interface DashboardStats {
  totalReceipts: number;
  totalSpent: number;
  averageReceiptValue: number;
  highestReceiptValue: number;
}

export interface SpendingOverTimePoint {
  date: string;
  total: number;
}

export interface MonthlySpendingPoint {
  month: string;
  total: number;
}

export interface CategoryDistributionPoint {
  category: string;
  total: number;
}

export interface TopPurchasePoint {
  description: string;
  total: number;
}

export interface DecodedTokenPayload {
  id?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export interface UseDashboardControllerReturn {
  loading: boolean;
  error: string;
  stats: DashboardStats;
  spendingOverTime: SpendingOverTimePoint[];
  monthlySpending: MonthlySpendingPoint[];
  categoryDistribution: CategoryDistributionPoint[];
  topPurchases: TopPurchasePoint[];
}
  