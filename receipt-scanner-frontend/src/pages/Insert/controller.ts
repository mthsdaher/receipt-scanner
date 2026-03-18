import { useState } from "react";
import { ParsedReceipt } from "../../utils/dataExtractor";
import { useAuth } from "../../contexts/AuthContext";
import { useAuthUserId } from "../../hooks/useAuthUserId";
import { ApiClientError, apiClient } from "../../services/apiClient";

interface ApiSuccessResponse<T> {
  status: "success";
  data: T;
}

interface ReceiptFormData {
  store: string;
  total: string;
  date: string;
  category: string;
}

const EMPTY_FORM: ReceiptFormData = {
  store: "",
  total: "",
  date: "",
  category: "grocery",
};

export const useInsertReceiptController = () => {
  const { signOut } = useAuth();
  const userId = useAuthUserId();

  const [file, setFile] = useState<File | null>(null);
  const [receiptForm, setReceiptForm] = useState<ReceiptFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);
    setSaved(false);
    setError("");
  };

  const handleFieldChange =
    (field: keyof ReceiptFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setReceiptForm((current) => ({ ...current, [field]: event.target.value }));
      setSaved(false);
      setError("");
    };

  // Upload image to backend — receives { status, data: { store, total, date } }.
  // Users can still edit these values before saving.
  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const response = await apiClient.postForm<ApiSuccessResponse<ParsedReceipt>>(
        "/api/v1/paddle/ocr",
        formData,
        signOut
      );
      const data = response.data;

      setReceiptForm({
        store: data.store ?? "",
        total: data.total !== undefined && data.total !== null ? String(data.total) : "",
        date: data.date ?? "",
        category: "grocery",
      });
    } catch (err) {
      console.error("OCR upload failed:", err);
      if (err instanceof ApiClientError && err.status === 429) {
        setError("OCR is temporarily rate-limited. Please wait a moment and try again.");
      } else {
        setError("Failed to process OCR. You can still fill the receipt manually.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Save parsed/manual receipt data to the database.
  const handleSave = async () => {
    if (!userId) return;
    if (!receiptForm.store.trim() || !receiptForm.total.trim() || !receiptForm.date.trim()) {
      setError("Please provide store, total amount, and date before saving.");
      return;
    }

    const amount = Number(receiptForm.total);
    if (Number.isNaN(amount) || amount < 0) {
      setError("Total amount must be a valid positive number.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await apiClient.post(
        "/api/v1/receipts",
        {
          amount,
          date: receiptForm.date,
          description: receiptForm.store.trim(),
          category: receiptForm.category.trim() || "grocery",
        },
        signOut
      );
      setSaved(true);
    } catch (err) {
      console.error("Failed to save receipt:", err);
      if (err instanceof ApiClientError && err.status === 429) {
        setError("Too many save attempts. Please wait and try again.");
      } else {
        setError("Failed to save receipt. Please review the data and try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return {
    file,
    receiptForm,
    loading,
    saving,
    saved,
    error,
    userId,
    handleFileChange,
    handleFieldChange,
    handleUpload,
    handleSave,
  };
};
