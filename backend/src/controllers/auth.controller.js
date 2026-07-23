import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { StatusCodes } from 'http-status-codes';
import { User } from '../models/user.model.js';
import {
  generateTokens,
  generateAccessToken,
  storeRefreshToken,
  verifyRefreshToken,
} from '../utils/token.js';
import client from '../lib/redis.js';
import { setCookies } from '../lib/cookie.js';

export const signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(
        new ApiError(StatusCodes.BAD_REQUEST, 'User already exists')
      );
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    await storeRefreshToken(`refreshToken-${user._id}`, refreshToken);

    setCookies(res, accessToken, refreshToken);

    const userWithoutPassword = await User.findById(user._id).select(
      '-password'
    );

    return res.status(StatusCodes.CREATED).json(
      new ApiResponse(
        StatusCodes.CREATED,
        userWithoutPassword,
        'User created successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new ApiError(
          StatusCodes.BAD_REQUEST,
          'Email and password are required'
        )
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(
        new ApiError(StatusCodes.BAD_REQUEST, 'User does not exist')
      );
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return next(
        new ApiError(StatusCodes.BAD_REQUEST, 'Invalid password')
      );
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    await storeRefreshToken(`refreshToken-${user._id}`, refreshToken);

    setCookies(res, accessToken, refreshToken);

    const userWithoutPassword = await User.findById(user._id).select(
      '-password'
    );

    return res.status(StatusCodes.OK).json(
      new ApiResponse(
        StatusCodes.OK,
        userWithoutPassword,
        'User logged in successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const decodedToken = verifyRefreshToken(refreshToken);
      await client.del(`refreshToken-${decodedToken.userId}`);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(StatusCodes.OK).json(
      new ApiResponse(
        StatusCodes.OK,
        null,
        'User logged out successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return next(
        new ApiError(
          StatusCodes.UNAUTHORIZED,
          'You need to login first'
        )
      );
    }

    const decodedToken = verifyRefreshToken(refreshToken);

    const storedToken = await client.get(
      `refreshToken-${decodedToken.userId}`
    );

    if (!storedToken || storedToken !== refreshToken) {
      return next(
        new ApiError(
          StatusCodes.UNAUTHORIZED,
          'Invalid or expired refresh token'
        )
      );
    }

    const accessToken = generateAccessToken(decodedToken.userId);

    const user = await User.findById(decodedToken.userId).select(
      '-password'
    );

    setCookies(res, accessToken, refreshToken);

    return res.status(StatusCodes.OK).json(
      new ApiResponse(
        StatusCodes.OK,
        user,
        'Token refreshed successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return next(
        new ApiError(StatusCodes.NOT_FOUND, 'User not found')
      );
    }

    return res.status(StatusCodes.OK).json(
      new ApiResponse(
        StatusCodes.OK,
        user,
        'User profile fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};