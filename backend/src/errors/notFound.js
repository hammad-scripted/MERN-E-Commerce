import ApiError from '../utils/apiError.js';
import { StatusCodes } from 'http-status-codes';

 const notFound = (req, res, next) => {
  next(new ApiError(StatusCodes.NOT_FOUND, 'Route not found!'));
};

export default notFound;