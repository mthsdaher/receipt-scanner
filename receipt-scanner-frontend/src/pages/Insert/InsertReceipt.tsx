// pages/InsertReceipt.tsx
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { extractReceiptData, ParsedReceipt } from "../../utils/dataExtractor";
  import { jwtDecode } from "jwt-decode";

const InsertReceipt: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedReceipt | null>(null);
  const [ocrLines, setOcrLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      setUserId(decoded?.id || null);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setParsedData(null);
      setSaved(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3002/api/paddle/ocr", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setOcrLines(data.lines);
      const parsed = extractReceiptData(data.lines);
      setParsedData(parsed);
    } catch (err) {
      console.error("OCR upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!parsedData || !userId) return;

    try {
      const response = await fetch("http://localhost:3002/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedData.total,
          date: parsedData.date,
          description: parsedData.items.join(", "),
          category: "grocery",
        }),
      });

      if (response.ok) {
        setSaved(true);
      } else {
        throw new Error("Failed to save receipt");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto bg-white shadow rounded p-6">
        <h1 className="text-2xl font-bold mb-4">Insert Receipt</h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4"
        />

        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={!file || loading}
        >
          {loading ? "Processing..." : "Upload & Extract"}
        </button>

        {parsedData && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Extracted Data</h2>
            <div className="space-y-1 text-gray-700">
              <p>
                <strong>Company:</strong> {parsedData.company}
              </p>
              <p>
                <strong>Address:</strong> {parsedData.address}
              </p>
              <p>
                <strong>Subtotal:</strong> ${parsedData.subtotal}
              </p>
              <p>
                <strong>Tax:</strong> ${parsedData.tax}
              </p>
              <p>
                <strong>Total:</strong> ${parsedData.total}
              </p>
              <p>
                <strong>Date:</strong> {parsedData.date}
              </p>
              <p>
                <strong>Time:</strong> {parsedData.time}
              </p>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold">Items:</h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {parsedData.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={handleSave}
              className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={!userId}
            >
              Save to Database
            </button>
            {saved && (
              <p className="mt-2 text-green-600 font-medium">
                Receipt saved successfully!
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InsertReceipt;
