import dotenv from 'dotenv';
dotenv.config();
import dns from 'node:dns/promises';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import cookieParser from 'cookie-parser';
import express from 'express';
import chalk from 'chalk';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import errorHandler from './errors/errorHandler.js';
import notFound from './errors/notFound.js';
import { connectDB } from './db/connect.js';

const PORT = process.env.PORT || 5000;
const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'https://mern-e-commerce-xrw8.onrender.com',
  process.env.CLIENT_URL,
].filter(Boolean);
const appRoot = process.cwd();
const possibleFrontendDistPaths = [
  path.resolve(appRoot, 'frontend/dist'),
  path.resolve(appRoot, '../frontend/dist'),
  path.resolve(appRoot, 'backend/frontend/dist'),
];

const frontendDistPath = possibleFrontendDistPaths.find((distPath) => {
  return fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'));
});

const frontendIndexPath = frontendDistPath
  ? path.join(frontendDistPath, 'index.html')
  : null;

const hasFrontendBuild = Boolean(frontendDistPath && frontendIndexPath);

import { router as authRouter } from './routes/auth.route.js';
import { router as productRouter } from './routes/product.route.js';
import { router as cartRouter } from './routes/cart.route.js';
import { router as couponRouter } from './routes/coupon.route.js';
import { router as paymentRouter } from './routes/payment.route.js';
import { router as analyticsRouter } from './routes/analytics.route.js';

//! Middleware
app.use(express.json({ limit: '10mb' })); // default is 100kb
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without an Origin header (for example server health checks)
      // do not need CORS validation.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

//! Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/coupon', couponRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/analytics', analyticsRouter);

// Serve the Vite production build after API routes. This must be registered
// before the 404 middleware so browser requests such as GET / reach React.
if (hasFrontendBuild && frontendDistPath && frontendIndexPath) {
  app.use(express.static(frontendDistPath));

  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    return res.sendFile(frontendIndexPath);
  });
}

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
