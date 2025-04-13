// pages/InsertReceipt/InsertReceipt.tsx
import React, { useState } from 'react';
import Layout from '../../components/Layout.tsx';

const InsertReceipt = () => {
  const [file, setFile] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<string[]>([]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:3002/api/paddle/ocr', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setOcrResult(data.lines || []);
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Insert Receipt</h1>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4"
        />

        <button
          onClick={handleUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Upload & Read
        </button>

        <div className="mt-6">
          <h2 className="text-lg font-semibold">Parsed Text:</h2>
          <ul className="mt-2 text-gray-800">
            {ocrResult.map((line, idx) => (
              <li key={idx} className="border-b py-1">{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default InsertReceipt;
