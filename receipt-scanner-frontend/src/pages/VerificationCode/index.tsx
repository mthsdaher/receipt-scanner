import React from "react";
import Layout from "../../components/Layout";
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

const CODE_LENGTH = 6;

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

        <InfoText>Enter the verification code for:</InfoText>
        <InfoText><strong>{email}</strong></InfoText>
        <InfoText>Expires in {formattedTimer}</InfoText>

        <Input
          placeholder={`Enter ${CODE_LENGTH}\u2011digit code`}

          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
        />

        <Button type="button" onClick={handleVerify} disabled={isVerifying || codeInput.length !== CODE_LENGTH}>
          {isVerifying ? "Verifying..." : "Verify Code"}
        </Button>

        <ResendButton type="button" onClick={handleResend} disabled={formattedTimer !== "00:00"}>
          Resend Code
        </ResendButton>

        {verifyError && <ErrorText>{verifyError}</ErrorText>}
      </Container>
    </Layout>
  );
};

export default VerificationCode;
