import styled from 'styled-components';

export const Container = styled.div`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: white;
  padding: 2rem;
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #0b666a;
  margin-bottom: 1rem;
`;

export const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #333;
  max-width: 600px;
  text-align: center;
  margin-bottom: 2rem;
`;

export const Button = styled.button`
  background-color: #35a29f;
  color: white;
  font-weight: 600;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: #28938f;
  }
`;
