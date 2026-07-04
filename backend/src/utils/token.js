import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
import client from './../lib/redis.js';

// * Generate Tokens
export const generateTokens = (id) => {
  const accessToken = generateAccessToken(id);
  const refreshToken = generateRefreshToken(id);

  return {
    accessToken,
    refreshToken,
  };
};
export const generateAccessToken = (id) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const generateRefreshToken = (id) => {
  return jwt.sign({ userId: id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};
export const decodeToken = (token) => {
  return jwt.decode(token);
};


// ? Redis

export const storeRefreshToken = async (userId, refreshToken) => {
  try{
    await client.set(userId, refreshToken, 'EX', 7 * 24 * 60 * 60); // Store for 7 days
  }
  catch (error) {
    console.log(error);
  }
}