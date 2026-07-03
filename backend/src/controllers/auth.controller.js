import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { StatusCodes } from 'http-status-codes';
import { User } from '../models/user.model.js';
import {generateToken} from '../utils/token.js'

export const signup = async (req, res, next) => {
  const { email, password, name } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, 'User already exists'));
  }
  const user = await User.create({
    name,
    email,
    password
  });


  const token =generateToken(user._id);
user.token = token

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(StatusCodes.CREATED, user, 'User created successfully'),
    );
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(
        new ApiResponse(StatusCodes.BAD_REQUEST, null, 'User does not exist'),
      );
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(new ApiResponse(StatusCodes.BAD_REQUEST, null, 'Invalid password'));
  }

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, user, 'User logged in successfully'));
};

export const logout = async (req, res, next) => {
  res.send('logout');
};
