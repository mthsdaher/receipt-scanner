export const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit code (100000–999999)
  };