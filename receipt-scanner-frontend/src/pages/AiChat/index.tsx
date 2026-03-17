import React, { useRef, useEffect } from "react";
import Layout from "../../components/Layout";
import { useAiChatController } from "./controller";
import {
  Container,
  Header,
  Title,
  InfoText,
  MessagesArea,
  MessageBubble,
  MessageLabel,
  MessageContent,
  InputRow,
  Input,
  SendButton,
  ErrorMessage,
  EmptyState,
} from "./styles";

const AiChat: React.FC = () => {
  const { messages, loading, error, sendMessage } = useAiChatController();
  const [input, setInput] = React.useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <Layout>
      <Container>
        <Header>
          <Title>AI Assistant</Title>
          <InfoText>
            Ask questions about your receipts, add new ones, or search by description. The assistant
            can list, filter, and summarize your data.
          </InfoText>
        </Header>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <MessagesArea>
          {messages.length === 0 && !loading && (
            <EmptyState>
              Start a conversation. Try: &quot;What were my biggest expenses last month?&quot; or
              &quot;List my receipts from this year.&quot;
            </EmptyState>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} $isUser={msg.role === "user"}>
              <MessageLabel>{msg.role === "user" ? "You" : "Assistant"}</MessageLabel>
              <MessageContent>{msg.content}</MessageContent>
            </MessageBubble>
          ))}
          {loading && (
            <MessageBubble $isUser={false}>
              <MessageLabel>Assistant</MessageLabel>
              <MessageContent>Thinking...</MessageContent>
            </MessageBubble>
          )}
          <div ref={messagesEndRef} />
        </MessagesArea>

        <InputRow onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            maxLength={1000}
          />
          <SendButton type="submit" disabled={loading || !input.trim()}>
            Send
          </SendButton>
        </InputRow>
      </Container>
    </Layout>
  );
};

export default AiChat;
