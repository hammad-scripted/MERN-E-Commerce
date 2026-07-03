import { body, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/apiError.js';

const userValidationRules = () => {
  return [
    body('fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required'),

    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required'),

    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email'),

    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map((err) => ({
    [err.path]: err.msg,
  }));

  return next(
    new ApiError(
      StatusCodes.BAD_REQUEST,
      'Validation Error',
      extractedErrors
    )
  );
};

export { userValidationRules, validate };