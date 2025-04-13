import express from 'express';
import axios from 'axios';
import FormData from 'form-data';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/ocr', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file?.path;

    if (!filePath) {
      res.status(400).json({ error: 'File missing' });
      return;
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const response = await axios.post('http://localhost:8000/ocr', formData, {
      headers: formData.getHeaders(),
    });

    fs.unlinkSync(filePath); // clean temp file

    res.json(response.data); // ✅ apenas envie, sem "return"
  } catch (error) {
    res.status(500).json({ error: 'Failed to OCR image' });
  }
});

export default router;
