import Layout from '@components/Layout';
import { Container, Title, Subtitle, Button } from './styles';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <Container>
        <Title>Welcome to Receipt Scanner</Title>
        <Subtitle>Scan and organize your receipts easily and securely.</Subtitle>
        <Button onClick={() => navigate('/insert-receipt')}>
          Start Scanning
        </Button>
      </Container>
    </Layout>
  );
};

export default Home;
