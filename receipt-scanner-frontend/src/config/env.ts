const FALLBACK_API_URL = "http://localhost:3002";

export const frontendEnv = {
  API_URL: process.env.REACT_APP_API_URL ?? FALLBACK_API_URL,
} as const;

