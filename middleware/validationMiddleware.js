// middleware/validationMiddleware.js

const { body, validationResult } = require('express-validator');

/**
 * Validation middleware for user registration.
 * Validates the name, email, and password fields.
 */
const validateRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * Validation middleware for item creation.
 * Validates the name, description, quantity, and useByDate fields.
 */
const validateItemCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Item name is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Item description is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('useByDate')
    .isISO8601()
    .withMessage('Invalid use-by date'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateRegistration,
  validateItemCreation,
};