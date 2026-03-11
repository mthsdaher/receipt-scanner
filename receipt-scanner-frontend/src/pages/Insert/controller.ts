import { useState } from "react";
import { ParsedReceipt } from "../../utils/dataExtractor";
import { useAuth } from "../../contexts/AuthContext";
import { useAuthUserId } from "../../hooks/useAuthUserId";
import { apiClient } from "../../services/apiClient";

export const useInsertReceiptController = () => {
  const { signOut } = useAuth();
  const userId = useAuthUserId();

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedReceipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setParsedData(null);
      setSaved(false);
    }
  };

  // Upload image to backend — receives { store, total, date } directly
  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
      const data = await apiClient.postForm<ParsedReceipt>(
        "/api/paddle/ocr",
        formData,
        signOut
      );
      console.log("Parsed receipt:", data);
      setParsedData(data);
    } catch (err) {
      console.error("OCR upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Save parsed receipt data to the database
  const handleSave = async () => {
    if (!parsedData || !userId) return;

    try {
      await apiClient.post(
        "/api/receipts",
        {
          amount: parsedData.total,
          date: parsedData.date,
          description: parsedData.store,
          category: "grocery",
        },
        signOut
      );
      setSaved(true);
    } catch (err) {
      console.error("Failed to save receipt:", err);
    }
  };

  return {
    file,
    parsedData,
    loading,
    saved,
    userId,
    handleFileChange,
    handleUpload,
    handleSave,
  };
};
