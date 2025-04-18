import { useEffect, useState } from "react";
import { ParsedReceipt, extractReceiptData } from "@utils/dataExtractor";
import { jwtDecode } from "jwt-decode";

export const useInsertReceiptController = () => {
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

  return {
    file,
    parsedData,
    ocrLines,
    loading,
    saved,
    userId,
    handleFileChange,
    handleUpload,
    handleSave,
  };
};
