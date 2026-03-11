import Layout from '../../components/Layout';
import { Container, Title, Subtitle, Button, HomeLogo } from './styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  return (
    <Layout>
      <Container>
        {!isLoggedIn ? (
          <HomeLogo src="/logo.jpg" alt="Receipt Scanner logo" />
        ) : (
          <Title>Welcome to Receipt Scanner</Title>
        )}
        <Subtitle>Scan and organize your receipts easily and securely.</Subtitle>
        <Button type="button" onClick={() => navigate(isLoggedIn ? '/insert-receipt' : '/signin')}>
          {isLoggedIn ? 'Start Scanning' : 'Log in to start scanning'}
        </Button>
      </Container>
    </Layout>
  );
};

export default Home;
