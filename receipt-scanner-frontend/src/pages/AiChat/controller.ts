import { useState, useCallback } from "react";
import { apiClient, ApiClientError } from "../../services/apiClient";
import { useAuth } from "../../contexts/AuthContext";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function useAiChatController() {
  const { signOut } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnauthorized = useCallback(() => {
    signOut();
  }, [signOut]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setError(null);
      setLoading(true);

      try {
        const res = await apiClient.post<{ status: string; data: { response: string } }>(
          "/api/ai/chat",
          { message: text.trim() },
          handleUnauthorized
        );

        const responseText = res.data?.response ?? "I couldn't generate a response. Please try again.";
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: responseText,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        if (err instanceof ApiClientError) {
          if (err.status === 503) {
            setError("AI features are not available. Please ensure the backend has OpenAI configured.");
          } else if (err.status === 401) {
            setError("Session expired. Redirecting to sign in...");
          } else {
            setError(err.message);
          }
        } else {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [loading, handleUnauthorized]
  );

  return { messages, loading, error, sendMessage };
}
