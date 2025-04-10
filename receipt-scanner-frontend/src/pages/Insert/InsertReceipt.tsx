import React, { useState, useRef } from 'react';
import { z } from 'zod';
import Webcam from 'react-webcam';
import Layout from '../../components/Layout.tsx';

const receiptSchema = z.object({
  amount: z.string().min(1, 'Amount must be greater than 0'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must follow YYYY-MM-DD format'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().optional(),
});

type ReceiptForm = z.infer<typeof receiptSchema>;

const InsertReceipt: React.FC = () => {
  const [formData, setFormData] = useState<ReceiptForm>({
    amount: '',
    date: '',
    description: '',
    category: '',
  });

  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const capture = () => {
    const imgSrc = webcamRef.current?.getScreenshot();
    if (imgSrc) setImage(imgSrc);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      const formatted = formatCurrencyInput(value);
      setFormData(prev => ({ ...prev, amount: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedData = {
      ...formData,
      amount: parseFloat(formData.amount).toFixed(2),
    };
    const result = receiptSchema.safeParse(parsedData);

    if (result.success) {
      console.log('✅ Valid receipt data:', result.data);
      console.log('🖼️ Captured image:', image);
      setErrors({});
    } else {
      const formattedErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0];
        if (typeof field === 'string') {
          formattedErrors[field] = err.message;
        }
      });
      setErrors(formattedErrors);
      console.warn('❌ Validation failed:', formattedErrors);
    }
  };

  const formatCurrencyInput = (input: string) => {
    const numbersOnly = input.replace(/\D/g, '');
    if (!numbersOnly) return '';
    const integer = numbersOnly.slice(0, -2) || '0';
    const decimal = numbersOnly.slice(-2).padStart(2, '0');
    return `${parseInt(integer, 10)}.${decimal}`;
  };

  return (
    <Layout>
      <div className="w-full min-h-[calc(100vh-64px)] bg-black text-white px-4 sm:px-6 lg:px-12 py-16">
        {/* Page Introduction */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Select How You Want to Upload Your Receipt
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
            You can either fill in the receipt data manually or take a photo of your receipt and let us extract the information for you.
          </p>
        </div>
  
        {/* Main Two-Column Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-8 md:gap-16">
          {/* Left Column: Manual Form */}
          <div className="flex flex-col justify-center">
            <h1 className="text-center text-2xl font-bold mb-6 text-white">Insert New Receipt</h1>
  
            <p className="text-center text-gray-400 mb-8">
              Fill out the receipt information below. This will help you keep track of your personal or business expenses.
              All fields are required unless marked as optional.
            </p>
  
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="text"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 border border-gray-700 bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-white"
                />
                {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
              </div>
  
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-700 bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-white"
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
  
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full px-4 py-2 border border-gray-700 bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-white"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
  
              <input
                type="text"
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                placeholder="Category (optional)"
                className="w-full px-4 py-2 border border-gray-700 bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-white"
              />
  
              <button
                type="submit"
                className="w-full border border-white text-white hover:bg-white hover:text-black transition py-2 px-4 rounded"
              >
                Submit Receipt
              </button>
            </form>
          </div>
  
          {/* Divider */}
          <div className="hidden md:block h-full w-px bg-gray-800 mx-auto" />
  
          {/* Right Column: Webcam and Info */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="self-center text-2xl font-bold mb-6 text-white">
              Take Photo From Your Receipt
            </h2>
            <p className="text-center text-gray-400 mb-8">
              Make sure your receipt is clearly visible and properly aligned in the frame before taking a photo. The image will be attached to your record.
            </p>
  
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="self-center rounded border border-gray-600 w-full max-w-md"
            />
            <button
              type="button"
              onClick={capture}
              className="self-center mt-3 w-full max-w-md border border-white text-white hover:bg-white hover:text-black transition py-2 px-4 rounded"
            >
              Capture Image
            </button>
  
            {image && (
              <img src={image} alt="Captured" className="w-full max-w-md rounded shadow mt-4" />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}  
export default InsertReceipt;
