import React from 'react';
import Layout from '@components/Layout';
import {
  Container,
  Title,
  Input,
  Button,
  ErrorText,
  ResendButton,
  InfoText,
} from './styles';
import { useSigninController } from './controller';

const Signin: React.FC = () => {
  const {
    email,
    password,
    error,
    allowResend,
    formattedTimer,
    handleChange,
    handleSubmit,
    handleResend,
  } = useSigninController();

  return (
    <Layout>
      <Container>
        <Title>Sign In</Title>

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleChange('email')}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={handleChange('password')}
        />

        <Button onClick={handleSubmit}>Login</Button>
        {error && <ErrorText>{error}</ErrorText>}

        {/* show resend only if login failed due to activation */}
        {error === 'Account not activated. Please verify your account.' && (
          <>
            <InfoText>Didn't receive a code or it expired?</InfoText>
            <ResendButton onClick={handleResend} disabled={!allowResend}>
              {allowResend ? 'Resend Verification Code' : `Try again in ${formattedTimer}`}
            </ResendButton>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default Signin;
