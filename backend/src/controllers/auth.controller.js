import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { StatusCodes } from 'http-status-codes';
import { User } from '../models/user.model.js';
import { generateTokens } from '../utils/token.js';
import { storeRefreshToken } from '../utils/token.js';
import { verifyAccessToken, verifyRefreshToken } from '../utils/token.js';
import client from '../lib/redis.js';

import { setCookies } from '../lib/cookie.js';
export const signup = async (req, res, next) => {
  const { email, password, name } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, 'User already exists'));
  }
  const user = await User.create({
    name,
    email,
    password,
  });

  //! Generate JWT token
  const { accessToken, refreshToken } = generateTokens(user._id);

  //! Store refresh token in Redis
  await storeRefreshToken(`refreshToken-${user._id}`, refreshToken);

  // ! set cookies
  setCookies(res, accessToken, refreshToken);

  const userWithoutPassword = await User.findById(user._id).select('-password');

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(
        StatusCodes.CREATED,
        userWithoutPassword,
        'User created successfully',
      ),
    );
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(
        new ApiError(
          StatusCodes.BAD_REQUEST,
          null,
          'Email and password are required',
        ),
      );
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(new ApiError(StatusCodes.BAD_REQUEST, null, 'User does not exist'));
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(new ApiError(StatusCodes.BAD_REQUEST, null, 'Invalid password'));
  }

  //! Generate JWT token
  const { accessToken, refreshToken } = generateTokens(user._id);

  //! Store refresh token in Redis
  await storeRefreshToken(`refreshToken-${user._id}`, refreshToken);

  // ! set cookies
  setCookies(res, accessToken, refreshToken);

  const userWithoutPassword = await User.findById(user._id).select('-password');
  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        userWithoutPassword,
        'User logged in successfully',
      ),
    );
};

export const logout = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    const decodedToken = verifyRefreshToken(refreshToken);
    await client.del(`refreshToken-${decodedToken.userId}`);
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(StatusCodes.OK, null, 'User logged out successfully'),
    );
};
