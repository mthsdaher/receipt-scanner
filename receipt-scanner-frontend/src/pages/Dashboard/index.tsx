import React, { useEffect } from 'react';
import Layout from '@components/Layout';
import { Container, Title, Card, CardTitle, CardText } from './styles';
import { useDashboardController } from './controller';

const Dashboard = () => {
  const { receipts, fetchReceipts } = useDashboardController();

  useEffect(() => {
    fetchReceipts();
  }, []);

  return (
    <Layout>
      <Container>
        <Title>Your Receipt Summary</Title>
        {receipts.map((receipt) => (
          <Card key={receipt._id}>
            <CardTitle>{receipt.description}</CardTitle>
            <CardText>Total: ${receipt.totalValue}</CardText>
            <CardText>Date: {new Date(receipt.date).toLocaleDateString()}</CardText>
          </Card>
        ))}
      </Container>
    </Layout>
  );
};

export default Dashboard;
