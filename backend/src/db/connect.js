import mongoose from 'mongoose';
import chalk from 'chalk';
import ApiError from '../utils/apiError.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      chalk.magentaBright.bold.underline(
        `MongoDB Connected: ${conn.connection.host}`,
      ),
    );
  } catch (error) {
    console.log(error);
    throw new ApiError(500, 'DB connection failed', [], error);
  }
};