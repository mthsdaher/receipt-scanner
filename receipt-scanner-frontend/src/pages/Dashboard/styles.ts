import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding: 0.75rem 0 1.5rem;
`;

export const Title = styled.h2`
  font-size: 2rem;
  margin: 0 0 0.3rem;
  color: #0f172a;
`;

export const Subtitle = styled.p`
  margin: 0;
  color: #64748b;
`;

export const Section = styled.section`
  margin-top: 1.2rem;
`;

export const FilterBar = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
`;

export const FilterLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
`;

export const FilterButton = styled.button<{ $active: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? "#0b666a" : "#cbd5e1")};
  background: ${({ $active }) => ($active ? "#0b666a" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#334155")};
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 160ms ease;

  &:hover {
    border-color: #0b666a;
    color: ${({ $active }) => ($active ? "#ffffff" : "#0b666a")};
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled.article`
  background: linear-gradient(140deg, #0b666a 0%, #35a29f 100%);
  color: #ffffff;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 8px 18px rgba(11, 102, 106, 0.22);
`;

export const StatLabel = styled.p`
  margin: 0;
  font-size: 0.86rem;
  opacity: 0.9;
`;

export const StatValue = styled.p`
  margin: 0.35rem 0 0;
  font-size: 1.5rem;
  font-weight: 700;
`;

export const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const ChartCard = styled.article`
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
`;

export const ChartTitle = styled.h3`
  margin: 0 0 0.8rem;
  font-size: 1.05rem;
  color: #0f172a;
`;

export const ChartWrapper = styled.div`
  width: 100%;
  height: 320px;
`;

export const FullWidthChartCard = styled(ChartCard)`
  margin-top: 1rem;
`;

export const FullWidthChartWrapper = styled(ChartWrapper)`
  height: 360px;
`;

export const MessageCard = styled.div`
  margin-top: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 10px;
  background-color: #f8fafc;
  color: #475569;
`;

export const ErrorCard = styled(MessageCard)`
  background-color: #fef2f2;
  color: #b91c1c;
`;
