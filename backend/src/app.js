import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFound } from './middleware/notFound.middleware.js';
import { env } from './config/env.js';

export const app = express();

app.use(helmet());

// Read the origin from the environment, falling back to localhost for local development
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: frontendUrl, credentials: true }));

app.use(express.json());
app.use(morgan('dev'));

app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);