import styled from "styled-components";

export const Container = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding: 0.75rem 0 1.5rem;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const Title = styled.h1`
  font-size: 2rem;
  margin: 0;
  color: #111827;
`;

export const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
`;

export const Select = styled.select`
  min-width: 200px;
  padding: 0.55rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #ffffff;
  color: #111827;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: #0b666a;
    box-shadow: 0 0 0 3px rgba(11, 102, 106, 0.15);
  }
`;

export const InfoText = styled.p`
  margin: 0.5rem 0 1rem;
  color: #6b7280;
`;

export const Message = styled.p`
  margin: 1rem 0;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  background-color: #f3f4f6;
  color: #374151;
`;

export const ErrorMessage = styled(Message)`
  background-color: #fef2f2;
  color: #b91c1c;
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.article`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
`;

export const CardTitle = styled.h3`
  margin: 0 0 0.6rem;
  font-size: 1.05rem;
  color: #111827;
`;

export const Row = styled.p`
  margin: 0.3rem 0;
  color: #374151;
  font-size: 0.95rem;
`;

export const Value = styled.span`
  font-weight: 700;
  color: #0b666a;
`;
