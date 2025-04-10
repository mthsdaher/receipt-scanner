import React, { useState, useRef } from 'react';
import { z } from 'zod';
import Tesseract from 'tesseract.js';
import Layout from '../../components/Layout.tsx';
import { parseReceiptText } from '../../utils/dataManipulation.ts';

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

  const [step, setStep] = useState<'upload' | 'preview' | 'confirm'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result as string;
      setImage(imageData);
      runOCR(imageData);
    };
    reader.readAsDataURL(file);
  };

  const runOCR = async (imageData: string) => {
    setIsLoading(true);
    try {
      const result = await Tesseract.recognize(imageData, 'eng');
      const text = result.data.text;
      console.log('OCR result:', text);
  
      const parsed = parseReceiptText(text);
      console.log('Parsed:', parsed);
  
      setFormData({
        amount: parsed.total.toFixed(2),
        date: parsed.date,
        description: parsed.items.map(i => i.name).join(', '),
        category: '',
      });
  
      setStep('preview');
    } catch (err) {
      console.error('OCR failed:', err);
    } finally {
      setIsLoading(false);
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
      setStep('confirm');
    } else {
      const formattedErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0];
        if (typeof field === 'string') {
          formattedErrors[field] = err.message;
        }
      });
      setErrors(formattedErrors);
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
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Select How You Want to Upload Your Receipt
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
            You can either fill in the receipt data manually or take a photo of your receipt and let us extract the information for you.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Manual Entry</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="amount"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: formatCurrencyInput(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-600 bg-black text-white rounded"
              />
              <input
                type="date"
                name="date"
                placeholder="Date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-600 bg-black text-white rounded"
              />
              <input
                type="text"
                name="description"
                placeholder="Company name"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-600 bg-black text-white rounded"
              />
              <input
                type="text"
                name="category"
                placeholder="Category (optional)"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-600 bg-black text-white rounded"
              />
              <button
                type="submit"
                className="w-full border border-white text-white hover:bg-white hover:text-black transition py-2 px-4 rounded"
              >
                Submit Manually
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Upload a Photo</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-white"
            />
            {image && <img src={image} alt="Uploaded receipt" className="mt-4 rounded shadow" />}
          </div>
        </div>

        {step === 'preview' && (
          <div className="max-w-xl mx-auto bg-gray-900 border border-gray-700 rounded p-8 text-white mt-12">
            <h2 className="text-2xl font-semibold mb-4">Preview Receipt</h2>
            <div className="space-y-3 text-gray-300">
              <p><strong>Amount:</strong> ${formData.amount}</p>
              <p><strong>Date:</strong> {formData.date}</p>
              <p><strong>Description:</strong> {formData.description}</p>
              <p><strong>Category:</strong> {formData.category}</p>
            </div>
            <div className="flex justify-between gap-4 mt-8">
              <button
                onClick={() => setStep('upload')}
                className="w-1/2 border border-white text-white hover:bg-white hover:text-black transition py-2 px-4 rounded"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="w-1/2 bg-white text-black hover:bg-gray-200 transition py-2 px-4 rounded"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="max-w-lg mx-auto bg-green-900 border border-green-600 rounded p-10 text-center text-white mt-12">
            <h2 className="text-2xl font-bold mb-4">Receipt Submitted!</h2>
            <p className="text-gray-200">Your receipt has been successfully saved. Thank you!</p>
            <button
              className="mt-6 border border-white text-white hover:bg-white hover:text-black transition py-2 px-4 rounded"
              onClick={() => {
                setFormData({ amount: '', date: '', description: '', category: '' });
                setImage(null);
                setStep('upload');
              }}
            >
              Insert Another Receipt
            </button>
          </div>
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Processing Image...</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InsertReceipt;
