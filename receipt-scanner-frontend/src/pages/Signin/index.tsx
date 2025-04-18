import Layout from '@components/Layout';
import { useSigninController } from './controller';
import { Container, Title, Input, Button, ErrorText } from './styles';

const Signin = () => {
  const { email, password, error, handleChange, handleSubmit } = useSigninController();

  return (
    <Layout>
      <Container>
        <Title>Sign In</Title>
        <Input type="email" value={email} onChange={handleChange('email')} placeholder="Email" />
        <Input type="password" value={password} onChange={handleChange('password')} placeholder="Password" />
        <Button onClick={handleSubmit}>Login</Button>
        {error && <ErrorText>{error}</ErrorText>}
      </Container>
    </Layout>
  );
};

export default Signin;
