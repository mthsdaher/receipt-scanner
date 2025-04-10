// src/pages/Dashboard/Dashboard.tsx
import React, { useState } from "react";
import Layout from "../../components/Layout.tsx";

interface ReceiptData {
  seller: string;
  date: string;
  items: string[];
  value: number;
  taxes: number;
  totalValue: number;
}

const Dashboard: React.FC = () => {
  const [receiptData] = useState<ReceiptData>({
    seller: "Store ABC",
    date: "2023-10-25",
    items: ["Product 1", "Product 2"],
    value: 200,
    taxes: 20,
    totalValue: 220,
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Receipt Dashboard
        </h1>

        <div className="mb-4">
          <p>
            <strong>Seller:</strong> {receiptData.seller}
          </p>
          <p>
            <strong>Date:</strong> {receiptData.date}
          </p>
          <p>
            <strong>Items:</strong> {receiptData.items.join(", ")}
          </p>
          <p>
            <strong>Value:</strong> ${receiptData.value}
          </p>
          <p>
            <strong>Taxes:</strong> ${receiptData.taxes}
          </p>
          <p>
            <strong>Total:</strong> ${receiptData.totalValue}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
