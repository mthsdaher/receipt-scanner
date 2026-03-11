import React from "react";
import Layout from "../../components/Layout";
import { useHistoryController } from "./controller";
import {
  Card,
  CardGrid,
  CardTitle,
  Container,
  Controls,
  ErrorMessage,
  Header,
  InfoText,
  Label,
  Message,
  Row,
  Select,
  Title,
  Value,
} from "./styles";
import { SortOption } from "./types";

const sortOptionLabels: Record<SortOption, string> = {
  date: "Date (most recent)",
  value: "Total value (highest first)",
  description: "Description (A-Z)",
};

const History: React.FC = () => {
  const { receipts, loading, error, sortBy, setSortBy } = useHistoryController();

  return (
    <Layout>
      <Container>
        <Header>
          <Title>Receipt History</Title>
          <Controls>
            <Label htmlFor="history-sort">Sort by</Label>
            <Select
              id="history-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
            >
              {Object.entries(sortOptionLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Controls>
        </Header>

        <InfoText>
          Review all receipts extracted by OCR and saved to your account.
        </InfoText>

        {loading && <Message>Loading receipt history...</Message>}
        {!loading && error && <ErrorMessage>{error}</ErrorMessage>}

        {!loading && !error && receipts.length === 0 && (
          <Message>No receipts found yet. Add your first receipt to start building history.</Message>
        )}

        {!loading && !error && receipts.length > 0 && (
          <CardGrid>
            {receipts.map((receipt) => {
              const totalValue = receipt.totalValue ?? receipt.amount;
              const formattedDate = new Date(receipt.date).toLocaleDateString();

              return (
                <Card key={receipt.id}>
                  <CardTitle>{receipt.description || "Untitled receipt"}</CardTitle>
                  <Row>
                    Total: <Value>${Number(totalValue).toFixed(2)}</Value>
                  </Row>
                  <Row>Date: {formattedDate}</Row>
                  <Row>Category: {receipt.category || "Uncategorized"}</Row>
                </Card>
              );
            })}
          </CardGrid>
        )}
      </Container>
    </Layout>
  );
};

export default History;
