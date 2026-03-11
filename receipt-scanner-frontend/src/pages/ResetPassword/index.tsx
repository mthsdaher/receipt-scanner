import React from "react";
import Layout from "../../components/Layout";
import {
  Container,
  Title,
  Input,
  Button,
  ErrorText,
  SuccessText,
} from "./styles";
import { useResetPasswordController } from "./controller";

const ResetPassword: React.FC = () => {
  const {
    email,
    resetToken,
    newPassword,
    error,
    successMessage,
    handleChange,
    handleSubmit,
  } = useResetPasswordController();

  return (
    <Layout>
      <Container>
        <Title>Reset Password</Title>

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleChange("email")}
        />
        <Input
          type="text"
          placeholder="Reset token"
          value={resetToken}
          onChange={handleChange("resetToken")}
        />
        <Input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={handleChange("newPassword")}
        />

        <Button type="button" onClick={handleSubmit}>
          Reset Password
        </Button>

        {error && <ErrorText>{error}</ErrorText>}
        {successMessage && <SuccessText>{successMessage}</SuccessText>}
      </Container>
    </Layout>
  );
};

export default ResetPassword;
