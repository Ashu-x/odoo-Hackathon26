import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFound } from './middleware/notFound.middleware.js';

export const app = express();

app.use(helmet());

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(express.json());
app.use(morgan('dev'));

app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);
