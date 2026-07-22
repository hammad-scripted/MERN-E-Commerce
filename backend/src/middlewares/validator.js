import { validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/apiError.js';


export const validate = (req, res, next) => {
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