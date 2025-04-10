import React, { useState, useRef } from 'react';
import { z } from 'zod';
import Webcam from 'react-webcam';
import Layout from '../../components/Layout.tsx';

const receiptSchema = z.object({
  seller: z.string().min(1, 'Seller name is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  items: z.array(z.string()).min(1, 'At least one item is required'),
  value: z.number().min(0, 'Value must be non-negative'),
  taxes: z.number().min(0, 'Taxes must be non-negative'),
  totalValue: z.number().min(0, 'Total value must be non-negative'),
});

interface ReceiptData {
  seller: string;
  date: string;
  items: string[];
  value: number;
  taxes: number;
  totalValue: number;
}

const Dashboard: React.FC = () => {
  const [receiptData, setReceiptData] = useState<ReceiptData>({
    seller: '',
    date: '',
    items: [],
    value: 0,
    taxes: 0,
    totalValue: 0,
  });

  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
    }
  };

  const updateReceipt = () => {
    const newData = {
      seller: 'Store ABC',
      date: '2023-10-25',
      items: ['Product 1', 'Product 2'],
      value: 200,
      taxes: 20,
      totalValue: 220,
    };

    const result = receiptSchema.safeParse(newData);
    if (result.success) {
      setReceiptData(newData);
    } else {
      console.error('Validation errors:', result.error);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Receipt Dashboard</h1>

        <div className="mb-4">
          <p><strong>Seller:</strong> {receiptData.seller}</p>
          <p><strong>Date:</strong> {receiptData.date}</p>
          <p><strong>Items:</strong> {receiptData.items.join(', ')}</p>
          <p><strong>Value:</strong> ${receiptData.value}</p>
          <p><strong>Taxes:</strong> ${receiptData.taxes}</p>
          <p><strong>Total:</strong> ${receiptData.totalValue}</p>
        </div>

        <button
          onClick={updateReceipt}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300 mb-6"
        >
          Simulate Receipt Update
        </button>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={350}
              className="rounded border shadow"
            />
            <button
              onClick={capture}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
            >
              Capture Photo
            </button>
          </div>

          {image && (
            <div>
              <p className="text-gray-600 text-sm mb-2">Captured Image:</p>
              <img src={image} alt="Captured Receipt" className="w-72 rounded shadow" />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
