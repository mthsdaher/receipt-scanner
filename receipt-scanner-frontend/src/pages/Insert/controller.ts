import { useEffect, useState } from "react";
import { ParsedReceipt, extractReceiptData } from "@utils/dataExtractor";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "contexts/AuthContext";
import { buildApiUrl } from "services/api";

export const useInsertReceiptController = () => {
  const { signOut } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedReceipt | null>(null);
  const [ocrLines, setOcrLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUserId(decoded?.id || null);
      } catch (err) {
        console.error("Failed to decode token:", err);
        signOut();
      }
    }
  }, [signOut]);

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
      const response = await fetch(buildApiUrl("/api/paddle/ocr"), {
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

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(buildApiUrl("/api/receipts"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parsedData.total,
          date: parsedData.date,
          description: parsedData.store,
          category: "grocery",
        }),
      });

      if (response.ok) {
        setSaved(true);
      } else if (response.status === 401) {
        signOut();
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
