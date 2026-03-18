import { Router, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env";
import { UserService } from "../services/UserService";
import { authRateLimiter } from "../middleware/rate-limiters";

const router = Router();
const redirectUri = `${env.BACKEND_PUBLIC_URL}/api/v1/auth/google/callback`;

function isGoogleOAuthConfigured(): boolean {
  return !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

router.get(
  "/google",
  authRateLimiter,
  (req: Request, res: Response) => {
    if (!isGoogleOAuthConfigured()) {
      res.redirect(`${env.FRONTEND_URL}/signin?error=oauth_not_configured`);
      return;
    }
    const client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: ["email", "profile"],
      prompt: "consent",
    });
    res.redirect(url);
  }
);

router.get(
  "/google/callback",
  authRateLimiter,
  async (req: Request, res: Response) => {
    if (!isGoogleOAuthConfigured()) {
      res.redirect(`${env.FRONTEND_URL}/signin?error=oauth_not_configured`);
      return;
    }
    const { code, error } = req.query;
    if (error) {
      res.redirect(`${env.FRONTEND_URL}/signin?error=oauth_denied`);
      return;
    }
    if (typeof code !== "string") {
      res.redirect(`${env.FRONTEND_URL}/signin?error=oauth_invalid`);
      return;
    }
    try {
      const client = new OAuth2Client(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );
      const { tokens } = await client.getToken(code);
      client.setCredentials(tokens);
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload?.email) {
        res.redirect(`${env.FRONTEND_URL}/signin?error=oauth_no_email`);
        return;
      }
      const { token } = await UserService.loginOrCreateWithGoogle(
        payload.email,
        payload.name ?? ""
      );
      res.redirect(`${env.FRONTEND_URL}/signin?token=${encodeURIComponent(token)}`);
    } catch {
      res.redirect(`${env.FRONTEND_URL}/signin?error=oauth_failed`);
    }
  }
);

export default router;
