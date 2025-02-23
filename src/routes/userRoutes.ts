import { Router } from 'express';
import { signup, login, getUsers } from '../controllers/userController';
const { validationResult } = require('express-validator');
const { check } = require('express-validator');

const router = Router();

// POST /api/users/signup - Register a new user
router.post(
  '/signup',
  [
    check('fullName').notEmpty().withMessage('Full name is required'),
    check('age').isNumeric().withMessage('Age must be a number'),
    check('email').isEmail().withMessage('Valid email is required'),
    check('cellNumber').notEmpty().withMessage('Cell number is required'),
    check('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)'),
  ],
  signup
);

// POST /api/users/login - Login an existing user
router.post(
  '/login',
  [
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// GET /api/users - List all users
router.get('/', getUsers);

export default router;