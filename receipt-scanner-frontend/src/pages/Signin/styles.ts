import styled from 'styled-components';

export const Container = styled.div`
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
`;

export const Title = styled.h2`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

export const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #0b666a;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

export const ErrorText = styled.p`
  color: red;
  margin-top: 1rem;
  text-align: center;
`;

export const ResendButton = styled.button`
  display: block;
  margin: 1rem auto;
  background: none;
  border: none;
  color: #0b666a;
  text-decoration: underline;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const InfoText = styled.p`
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;