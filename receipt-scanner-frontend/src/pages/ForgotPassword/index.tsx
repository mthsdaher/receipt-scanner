import React from "react";
import Layout from "../../components/Layout";
import {
  Container,
  Title,
  HelperText,
  Input,
  Button,
  SuccessText,
  ErrorText,
  LinkButton,
} from "./styles";
import { useForgotPasswordController } from "./controller";

const ForgotPassword: React.FC = () => {
  const {
    email,
    resetToken,
    error,
    successMessage,
    handleEmailChange,
    handleSubmit,
    goToResetPassword,
  } = useForgotPasswordController();

  return (
    <Layout>
      <Container>
        <Title>Forgot Password</Title>
        <HelperText>
          Enter your account email to generate a password reset token.
        </HelperText>

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
        />
        <Button type="button" onClick={handleSubmit}>
          Request Reset
        </Button>

        {successMessage && <SuccessText>{successMessage}</SuccessText>}
        {resetToken && <SuccessText>Reset token: {resetToken}</SuccessText>}
        {error && <ErrorText>{error}</ErrorText>}

        <LinkButton type="button" onClick={goToResetPassword}>
          Go to reset password
        </LinkButton>
      </Container>
    </Layout>
  );
};

export default ForgotPassword;
