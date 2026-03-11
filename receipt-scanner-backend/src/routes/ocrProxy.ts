import express from "express";
import axios from "axios";
import FormData from "form-data";
import multer from "multer";
import fs from "fs";
import { env } from "../config/env";
import { currentUser } from "../middleware/current-user";
import { requireAuth } from "../middleware/require-auth";
import { ocrRateLimiter } from "../middleware/rate-limiters";

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
  fs.promises.unlink(filePath).catch((err) => console.error("[OCR] Cleanup failed:", err));
};

const handleUpload = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  upload.single("file")(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({
          status: "error",
          message: "File too large. Max size is 5MB.",
        });
        return;
      }

      // We use LIMIT_UNEXPECTED_FILE for unsupported MIME types in fileFilter.
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        res.status(415).json({
          status: "error",
          message: "Unsupported file type. Allowed: JPG, PNG, WEBP.",
        });
        return;
      }
    }

    res.status(400).json({
      status: "error",
      message: "Invalid upload payload.",
    });
  });
};

router.post("/ocr", currentUser, requireAuth, ocrRateLimiter, handleUpload, async (req, res) => {
  const filePath = req.file?.path;

  if (!filePath) {
    res.status(400).json({ status: "error", message: "File missing" });
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const response = await axios.post(`${env.OCR_SERVICE_URL}/ocr`, formData, {
      headers: formData.getHeaders(),
    });

    cleanupFile(filePath);
    res.json({
      status: "success",
      data: response.data,
    });
  } catch (error) {
    cleanupFile(filePath);
    res.status(500).json({ status: "error", message: "Failed to OCR image" });
  }
});

export default router;
