import express from "express";
import axios from "axios";
import FormData from "form-data";
import multer from "multer";
import fs from "fs";
import { env } from "../config/env";
import { currentUser } from "../middleware/current-user";
import { requireAuth } from "../middleware/require-auth";
import { ocrRateLimiter } from "../middleware/rate-limiters";
import { appLogger, createRequestLogger } from "../utils/logger";

const router = express.Router();
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: MAX_UPLOAD_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(
        new multer.MulterError("LIMIT_UNEXPECTED_FILE", "file")
      );
      return;
    }
    cb(null, true);
  },
});

/** Async file cleanup - avoids blocking event loop */
const cleanupFile = (filePath: string): void => {
  fs.promises.unlink(filePath).catch((err) => {
    appLogger.warn(
      { event: "ocr_cleanup_failed", filePath, error: (err as Error).message },
      "OCR cleanup failed"
    );
  });
};

const sendError = (
  req: express.Request,
  res: express.Response,
  statusCode: number,
  code: string,
  message: string
): void => {
  res.status(statusCode).json({
    status: "error",
    code,
    message,
    requestId: req.requestId ?? "unknown",
  });
};

const handleUpload = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  upload.single("file")(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        sendError(req, res, 413, "PAYLOAD_TOO_LARGE", "File too large. Max size is 5MB.");
        return;
      }

      // We use LIMIT_UNEXPECTED_FILE for unsupported MIME types in fileFilter.
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        sendError(
          req,
          res,
          415,
          "UNSUPPORTED_MEDIA_TYPE",
          "Unsupported file type. Allowed: JPG, PNG, WEBP."
        );
        return;
      }
    }

    sendError(req, res, 400, "INVALID_UPLOAD_PAYLOAD", "Invalid upload payload.");
  });
};

router.post("/ocr", currentUser, requireAuth, ocrRateLimiter, handleUpload, async (req, res) => {
  const filePath = req.file?.path;
  const requestId = req.requestId ?? "unknown";
  const reqLogger = createRequestLogger({ requestId, component: "ocr" });

  if (!filePath) {
    sendError(req, res, 400, "FILE_MISSING", "File missing");
    return;
  }

  const startTime = Date.now();
  reqLogger.info({ event: "ocr_processing_started", filePath }, "OCR processing started");

  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const response = await axios.post(`${env.OCR_SERVICE_URL}/ocr`, formData, {
      headers: formData.getHeaders(),
      timeout: env.OCR_UPSTREAM_TIMEOUT_MS,
    });

    cleanupFile(filePath);
    const durationMs = Date.now() - startTime;
    const data = response.data as Record<string, unknown>;
    reqLogger.info(
      {
        event: "ocr_processing_completed",
        durationMs,
        userId: req.currentUser?.id,
        hasData: !!data,
        keys: data ? Object.keys(data) : [],
      },
      "OCR processing completed"
    );
    res.json({
      status: "success",
      data: response.data,
    });
  } catch (error) {
    cleanupFile(filePath);
    const durationMs = Date.now() - startTime;

    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        reqLogger.warn(
          { event: "ocr_upstream_timeout", durationMs, userId: req.currentUser?.id },
          "OCR upstream timeout"
        );
        sendError(
          req,
          res,
          504,
          "OCR_UPSTREAM_TIMEOUT",
          "OCR service timeout. Please try again."
        );
        return;
      }

      if (error.response) {
        reqLogger.warn(
          {
            event: "ocr_upstream_error",
            durationMs,
            status: error.response.status,
            userId: req.currentUser?.id,
          },
          "OCR upstream error"
        );
        sendError(req, res, 502, "OCR_UPSTREAM_ERROR", "OCR upstream service returned an error.");
        return;
      }

      reqLogger.warn(
        { event: "ocr_upstream_unavailable", durationMs, userId: req.currentUser?.id },
        "OCR upstream unavailable"
      );
      sendError(
        req,
        res,
        503,
        "OCR_UPSTREAM_UNAVAILABLE",
        "OCR service unavailable. Please try again later."
      );
      return;
    }

    reqLogger.error(
      {
        event: "ocr_proxy_failure",
        durationMs,
        userId: req.currentUser?.id,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "OCR proxy failure"
    );
    sendError(req, res, 500, "OCR_PROXY_FAILURE", "Failed to OCR image");
  }
});

export default router;
