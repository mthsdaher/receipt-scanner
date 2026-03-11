import styled from 'styled-components';

export const Container = styled.div`
  width: min(440px, calc(100% - 2rem));
  margin: 4rem auto;
  padding: 2rem;
  background: linear-gradient(180deg, #ffffff 0%, #f9fcfc 100%);
  border: 1px solid #b6d5d7;
  border-radius: 16px;
  box-shadow:
    0 24px 52px rgba(11, 102, 106, 0.22),
    0 10px 22px rgba(15, 23, 42, 0.12);
`;

export const Title = styled.h2`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 1.75rem;
  color: #0b666a;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  position: relative;

  &::after {
    content: '';
    display: block;
    width: 72px;
    height: 4px;
    margin: 0.65rem auto 0;
    border-radius: 999px;
    background: linear-gradient(90deg, #0b666a 0%, #35a29f 100%);
  }
`;

export const Input = styled.input`
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 0.85rem 0.9rem;
  margin-bottom: 1rem;
  border: 1px solid #cfd8dc;
  border-radius: 10px;
  background-color: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: #0b666a;
    box-shadow: 0 0 0 3px rgba(11, 102, 106, 0.15);
    outline: none;
  }
`;

export const Button = styled.button`
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 0.85rem;
  background: linear-gradient(135deg, #0b666a 0%, #35a29f 100%);
  color: white;
  font-weight: bold;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;

  &:hover {
    filter: brightness(1.02);
    box-shadow: 0 8px 20px rgba(11, 102, 106, 0.28);
  }

  &:active {
    transform: translateY(1px);
  }
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

export const LinkButton = styled.button`
  display: block;
  margin: 0.75rem auto 0;
  background: none;
  border: none;
  color: #0b666a;
  text-decoration: underline;
  cursor: pointer;
`;