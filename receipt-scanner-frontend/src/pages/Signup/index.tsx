import React from 'react';
import Layout from '@components/Layout';
import {
  Container,
  Title,
  Input,
  Button,
  ErrorText,
  InfoText,
  ResendButton,
} from './styles';
import { useSignupController } from './controller';

const Signup: React.FC = () => {
  const {
    fullName,
    age,
    email,
    cellNumber,
    password,
    error,
    codeSent,
    formattedTimer,
    handleChange,
    handleSubmit,
    handleResend,
  } = useSignupController();

  return (
    <Layout>
      <Container>
        <Title>Create an Account</Title>
        <Input
          placeholder="Full Name"
          value={fullName}
          onChange={handleChange('fullName')}
        />
        <Input
          placeholder="Age"
          value={age}
          onChange={handleChange('age')}
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={handleChange('email')}
        />
        <Input
          placeholder="Cell Number"
          value={cellNumber}
          onChange={handleChange('cellNumber')}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={handleChange('password')}
        />
        <Button onClick={handleSubmit}>
          {codeSent ? 'Resend Code' : 'Sign Up'}
        </Button>
        {error && <ErrorText>{error}</ErrorText>}

        {codeSent && (
          <>
            <InfoText>
              Code sent to your email! Check it before the times expire {formattedTimer}
            </InfoText>
            <ResendButton onClick={handleResend} disabled={formattedTimer !== '00:00'}>
              Resend Code
            </ResendButton>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default Signup;
