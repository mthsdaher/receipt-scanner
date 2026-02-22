import { frontendEnv } from "../config/env";

export const buildApiUrl = (path: string): string =>
  `${frontendEnv.API_URL}${path}`;

