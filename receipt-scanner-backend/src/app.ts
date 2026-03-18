import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { NotFoundError } from "./errors/AppError";
import { errorHandler } from "./middleware/errorHandler";
import logger, { appLogger } from "./middleware/logger";
import { requestTimeout } from "./middleware/request-timeout";
import { apiRateLimiter } from "./middleware/rate-limiters";
import aiRoutes from "./routes/aiRoutes";
import authRoutes from "./routes/authRoutes";
import healthRoutes from "./routes/healthRoutes";
import ocrProxy from "./routes/ocrProxy";
import receiptRoutes from "./routes/receiptRoutes";
import userRoutes from "./routes/userRoutes";

const app = express();
app.disable("x-powered-by");
const allowedOrigins =
  env.FRONTEND_URLS.length > 0 ? env.FRONTEND_URLS : [env.FRONTEND_URL];

if (env.TRUST_PROXY) {
  app.set("trust proxy", env.TRUST_PROXY_HOPS);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      appLogger.warn(
        { event: "cors_origin_blocked", origin, allowedOrigins },
        "CORS origin blocked"
      );
      callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(logger);
app.use(requestTimeout);
app.use("/api", apiRateLimiter);

const openapiPath = path.resolve(__dirname, "openapi.json");
// eslint-disable-next-line @typescript-eslint/no-require-imports
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(require(openapiPath)));

const API_V1 = "/api/v1";
app.use(`${API_V1}/auth`, authRoutes);
app.use(`${API_V1}/ai`, aiRoutes);
app.use(`${API_V1}/users`, userRoutes);
app.use(`${API_V1}/receipts`, receiptRoutes);
app.use(`${API_V1}/paddle`, ocrProxy);
app.use("/", healthRoutes);

app.use((_req, _res, next) => {
  next(new NotFoundError("Route not found"));
});

app.use(errorHandler);

export default app;
