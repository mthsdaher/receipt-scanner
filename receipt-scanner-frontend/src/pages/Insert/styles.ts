import styled from "styled-components";

export const PageContainer = styled.section`
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
`;

export const Card = styled.div`
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  padding: 1.6rem;
  transition: transform 180ms ease, box-shadow 180ms ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
  }

  @media (max-width: 768px) {
    padding: 1.2rem;
    border-radius: 14px;
  }
`;

export const Title = styled.h1`
  margin: 0 0 0.45rem;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0f172a;
`;

export const HelperText = styled.p`
  margin: 0 0 1.1rem;
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
`;

export const HiddenInput = styled.input`
  display: none;
`;

export const FileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const FileNameText = styled.span`
  color: #475569;
  font-size: 0.9rem;
`;

const sharedButtonStyles = `
  border: none;
  border-radius: 12px;
  padding: 0.65rem 1rem;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 180ms ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
    box-shadow: none;
  }
`;

export const SecondaryButton = styled.button`
  ${sharedButtonStyles}
  background-color: #f8fafc;
  border: 1px solid #d1d5db;
  color: #1f2937;

  &:hover:enabled {
    background-color: #f1f5f9;
    border-color: #94a3b8;
  }
`;

export const PrimaryButton = styled.button`
  ${sharedButtonStyles}
  background: linear-gradient(130deg, #0b666a 0%, #35a29f 100%);
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(11, 102, 106, 0.24);
  margin-bottom: 0.4rem;

  &:hover:enabled {
    transform: translateY(-1px);
    box-shadow: 0 10px 22px rgba(11, 102, 106, 0.28);
  }
`;

export const SaveButton = styled.button`
  ${sharedButtonStyles}
  background: linear-gradient(130deg, #0f766e 0%, #14b8a6 100%);
  color: #ffffff;
  box-shadow: 0 8px 16px rgba(15, 118, 110, 0.22);
  margin-top: 1.15rem;

  &:hover:enabled {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(15, 118, 110, 0.26);
  }
`;

export const LoadingStatus = styled.div`
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 12px;
  border: 1px solid #99f6e4;
  background-color: #f0fdfa;
  padding: 0.72rem 0.95rem;
`;

export const LoadingText = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: #115e59;
`;

export const Section = styled.div`
  margin-top: 1.6rem;
  padding-top: 1.1rem;
  border-top: 1px solid #e2e8f0;
`;

export const Subtitle = styled.h2`
  margin: 0 0 0.75rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.95rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  color: #334155;
  font-size: 0.87rem;
  font-weight: 600;
`;

export const TextInput = styled.input`
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 0.7rem 0.82rem;
  font-size: 0.92rem;
  color: #0f172a;
  background-color: #ffffff;
  transition: border-color 160ms ease, box-shadow 160ms ease;

  &:focus {
    outline: none;
    border-color: #0b666a;
    box-shadow: 0 0 0 3px rgba(11, 102, 106, 0.15);
  }
`;

export const SuccessMessage = styled.p`
  margin-top: 0.85rem;
  color: #0f766e;
  font-size: 0.9rem;
  font-weight: 600;
`;

export const ErrorMessage = styled.p`
  margin-top: 0.85rem;
  color: #dc2626;
  font-size: 0.9rem;
  font-weight: 600;
`;