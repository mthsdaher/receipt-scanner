import React, { useState, useRef } from 'react';
import { z } from 'zod';
import Webcam from 'react-webcam';

// Define the Zod schema for receipt data validation
const receiptSchema = z.object({
  seller: z.string().min(1, 'Seller name is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  items: z.array(z.string()).min(1, 'At least one item is required'),
  value: z.number().min(0, 'Value must be non-negative'),
  taxes: z.number().min(0, 'Taxes must be non-negative'),
  totalValue: z.number().min(0, 'Total value must be non-negative'),
});

// Interface for receipt data to ensure TypeScript type safety
interface ReceiptData {
  seller: string;
  date: string;
  items: string[];
  value: number;
  taxes: number;
  totalValue: number;
}

const Dashboard: React.FC = () => {
  // State to manage receipt data
  const [receiptData, setReceiptData] = useState<ReceiptData>({
    seller: '',
    date: '',
    items: [],
    value: 0,
    taxes: 0,
    totalValue: 0,
  });

  // Reference to the webcam component
  const webcamRef = useRef<Webcam>(null);
  // State to store the captured image from the webcam
  const [image, setImage] = useState<string | null>(null);

  // Function to capture an image from the webcam
  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      // Here, you could process the image (e.g., send to an OCR API) to extract receipt data
    }
  };

  // Function to update receipt data with Zod validation
  const updateReceipt = () => {
    // Simulated new receipt data (replace with actual data extraction logic if needed)
    const newData = {
      seller: 'Store ABC',
      date: '2023-10-25',
      items: ['Produect 1', 'Product 2'],
      value: 200,
      taxes: 20,
      totalValue: 220,
    };

    // Validate the new data against the Zod schema
    const result = receiptSchema.safeParse(newData);
    if (result.success) {
      setReceiptData(newData); // Update state if validation passes
    } else {
      console.error('Validation errors:', result.error); // Log validation errors
    }
  };

  return (
    <div>
      <h1>Receipt Dashboard</h1>
      <p>Seller: {receiptData.seller}</p>
      <p>Date: {receiptData.date}</p>
      <p>Items: {receiptData.items.join(', ')}</p>
      <p>Value: {receiptData.value}</p>
      <p>Taxes: {receiptData.taxes}</p>
      <p>Total: {receiptData.totalValue}</p>
      {/* Button to trigger receipt data update */}
      <button onClick={updateReceipt}>Update Receipt</button>

      {/* Webcam component for capturing receipt images */}
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={350}
      />
      {/* Button to capture an image from the webcam */}
      <button onClick={capture}>Capture Photo</button>
      {/* Display the captured image if available */}
      {image && <img src={image} alt="Captured Receipt" />}
    </div>
  );
};

export default Dashboard;