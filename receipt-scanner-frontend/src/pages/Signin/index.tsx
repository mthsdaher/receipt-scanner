import React from 'react';
import Layout from '../../components/Layout';
import {
  Container,
  Title,
  Input,
  Button,
  ErrorText,
  ResendButton,
  InfoText,
  LinkButton,
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
    goToForgotPassword,
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

        <Button type="button" onClick={handleSubmit}>Login</Button>
        <LinkButton type="button" onClick={goToForgotPassword}>
          Forgot password?
        </LinkButton>
        {error && <ErrorText>{error}</ErrorText>}

        {/* show resend only if login failed due to activation */}
        {error === 'Account not activated. Please verify your account.' && (
          <>
            <InfoText>Didn't receive a code or it expired?</InfoText>
            <ResendButton type="button" onClick={handleResend} disabled={!allowResend}>
              {allowResend ? 'Resend Verification Code' : `Try again in ${formattedTimer}`}
            </ResendButton>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default Signin;
