import express from "express";
import axios from "axios";
import FormData from "form-data";
import multer from "multer";
import fs from "fs";
import { env } from "../config/env";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/** Async file cleanup - avoids blocking event loop */
const cleanupFile = (filePath: string): void => {
  fs.promises.unlink(filePath).catch((err) => console.error("[OCR] Cleanup failed:", err));
};

router.post("/ocr", upload.single("file"), async (req, res) => {
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
    res.json(response.data);
  } catch (error) {
    cleanupFile(filePath);
    res.status(500).json({ status: "error", message: "Failed to OCR image" });
  }
});

export default router;
