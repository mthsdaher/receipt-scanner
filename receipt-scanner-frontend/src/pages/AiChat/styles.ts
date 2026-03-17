import styled from "styled-components";

export const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0.75rem 0 1.5rem;
  display: flex;
  flex-direction: column;
  min-height: 400px;
`;

export const Header = styled.div`
  margin-bottom: 1rem;
`;

export const Title = styled.h1`
  font-size: 2rem;
  margin: 0;
  color: #111827;
`;

export const InfoText = styled.p`
  margin: 0.5rem 0 1rem;
  color: #6b7280;
`;

export const MessagesArea = styled.div`
  flex: 1;
  min-height: 280px;
  max-height: 420px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  background-color: #f9fafb;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
`;

export const MessageBubble = styled.div<{ $isUser?: boolean }>`
  max-width: 85%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  align-self: ${({ $isUser }) => ($isUser ? "flex-end" : "flex-start")};
  background-color: ${({ $isUser }) => ($isUser ? "#0b666a" : "#ffffff")};
  color: ${({ $isUser }) => ($isUser ? "#ffffff" : "#111827")};
  border: 1px solid ${({ $isUser }) => ($isUser ? "transparent" : "#e5e7eb")};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
`;

export const MessageLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  display: block;
  margin-bottom: 0.35rem;
`;

export const MessageContent = styled.div`
  font-size: 0.95rem;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const InputRow = styled.form`
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
`;

export const Input = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #0b666a;
    box-shadow: 0 0 0 3px rgba(11, 102, 106, 0.15);
  }
`;

export const SendButton = styled.button`
  padding: 0.75rem 1.25rem;
  background-color: #0b666a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;

  &:hover:not(:disabled) {
    background-color: #095356;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.p`
  margin: 1rem 0;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  background-color: #fef2f2;
  color: #b91c1c;
`;

export const EmptyState = styled.p`
  color: #9ca3af;
  text-align: center;
  padding: 2rem 1rem;
  margin: 0;
`;
