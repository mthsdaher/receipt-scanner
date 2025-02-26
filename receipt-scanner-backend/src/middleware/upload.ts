import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to accept only images/PDFs
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const fileTypes = /jpeg|jpg|png|pdf/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, jpg, png) and PDFs are allowed'));
  }
};

// Configure multer upload
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit to 5MB
  fileFilter,
});

export default upload;