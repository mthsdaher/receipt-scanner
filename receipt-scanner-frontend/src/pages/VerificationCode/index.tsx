import React from "react";
import Layout from "@components/Layout";
import { useVerificationController } from "./controller";
import {
  Container,
  Title,
  Input,
  Button,
  ErrorText,
  InfoText,
  ResendButton,
} from "./styles";

const VerificationCode: React.FC = () => {
  const {
    email,
    codeInput,
    setCodeInput,
    verifyError,
    isVerifying,
    formattedTimer,
    handleResend,
    handleVerify,
  } = useVerificationController();

  return (
    <Layout>
      <Container>
        <Title>Verify Your Email</Title>

        <InfoText>Please enter the code sent to:</InfoText>
        <InfoText><strong>{email}</strong></InfoText>
        <InfoText>Expires in {formattedTimer}</InfoText>

        <Input
          placeholder="Enter 6‑digit code"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
        />

        <Button onClick={handleVerify} disabled={isVerifying || codeInput.length !== 6}>
          {isVerifying ? "Verifying..." : "Verify Code"}
        </Button>

        <ResendButton onClick={handleResend} disabled={formattedTimer !== "00:00"}>
          Resend Code
        </ResendButton>

        {verifyError && <ErrorText>{verifyError}</ErrorText>}
      </Container>
    </Layout>
  );
};

export default VerificationCode;
