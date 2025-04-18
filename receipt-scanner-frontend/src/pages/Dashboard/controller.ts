import { useState } from 'react';
import { Receipt } from './types';

export const useDashboardController = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const fetchReceipts = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;
      const response = await fetch(`http://localhost:3002/api/receipts/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setReceipts(data);
    } catch (err) {
      console.error('Failed to fetch receipts:', err);
    }
  };

  return { receipts, fetchReceipts };
};
