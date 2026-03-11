import styled from "styled-components";

export const Container = styled.div`
  max-width: 500px;
  margin: 4rem auto;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
`;

export const Title = styled.h2`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 1rem;
`;

export const HelperText = styled.p`
  text-align: center;
  margin-bottom: 1rem;
  color: #4b5563;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin: 1rem 0;
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

export const SuccessText = styled.p`
  color: #2e7d32;
  margin-top: 1rem;
  text-align: center;
  word-break: break-word;
`;

export const ErrorText = styled.p`
  color: red;
  margin-top: 1rem;
  text-align: center;
`;

export const LinkButton = styled.button`
  display: block;
  margin: 0.75rem auto 0;
  background: none;
  border: none;
  color: #0b666a;
  text-decoration: underline;
  cursor: pointer;
`;
