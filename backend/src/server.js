import dotenv from 'dotenv';
dotenv.config();
import dns from 'node:dns/promises';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import cookieParser from 'cookie-parser';
import express from 'express';
import chalk from 'chalk';
import morgan from 'morgan';
import cors from 'cors';

import errorHandler from './errors/errorHandler.js';
import notFound from './errors/notFound.js';
import { connectDB } from './db/connect.js';

const PORT = process.env.PORT || 5000;

const app = express();

import { router as authRouter } from './routes/auth.route.js';
import { router as productRouter } from './routes/product.route.js';
import { router as cartRouter } from './routes/cart.route.js';
import { router as couponRouter } from './routes/coupon.route.js';
import { router as paymentRouter } from './routes/coupon.route.js';
import { router as analyticsRouter } from './routes/analytics.route.js';

//! Middleware
app.use(express.json({ limit: '10mb' })); // default is 100kb
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(
  cors({
  origin: process.env.CLIENT_URL, // "http://localhost:5173"
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
);

//! Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/coupon', couponRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/analytics', analyticsRouter);

//! Error Middlewares
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
