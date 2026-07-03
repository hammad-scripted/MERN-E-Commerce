import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import chalk from 'chalk';
import errorHandler from './errors/errorHandler.js';
import notFound from './errors/notFound.js';
const PORT = process.env.PORT || 5000;
const app = express();

import { router as authRouter } from './routes/auth.route.js';


//* MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



//* ROUTES
app.use('/api/v1/auth', authRouter);

app.use(notFound);
app.use(errorHandler);




app.listen(PORT, () => {
  console.log(
    chalk.blueBright.bold.underline(`Server is running on port ${PORT}`),
  );
});
