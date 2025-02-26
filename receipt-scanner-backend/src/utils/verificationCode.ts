
export const generateVerificationCode = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a 4-digit code (1000–9999)
  };