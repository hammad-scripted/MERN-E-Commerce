import dotenv from 'dotenv';
dotenv.config();
import dns from 'node:dns/promises';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import cookieParser from 'cookie-parser';
import express from 'express';
import chalk from 'chalk';
import morgan from 'morgan';

import errorHandler from './errors/errorHandler.js';
import notFound from './errors/notFound.js';
import { connectDB } from './db/connect.js';

const PORT = process.env.PORT || 5000;

const app = express();

import { router as authRouter } from './routes/auth.route.js';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use('/api/v1/auth', authRouter);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    console.log(chalk.yellowBright.bold.underline('DB connected'));

    app.listen(PORT, () => {
      console.log(
        chalk.blueBright.bold.underline(`Server is running on port ${PORT}`),
      );
    });
  } catch (error) {
    console.log(chalk.redBright.bold.underline(`Error: ${error}`));

    process.exit(1);
  }
};

startServer();
