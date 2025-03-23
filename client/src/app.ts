// client/src/app.ts
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import favicon from 'serve-favicon';
import { RedisStore } from './redis';
import { logger } from './utils';
import { routes } from './routes';
import { authMiddleware, errorMiddleware, providerMiddleware } from './middleware';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Configure view engine
app.set('views', path.join(__dirname, '..', '/views'));
app.set('view engine', 'ejs');

// Configure middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', '/public')));
app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));

// Configure session middleware
app.use(session({
  store: new RedisStore(),
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.SESSION_COOKIE_SECURE === 'true',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Configure auth middleware
app.use(authMiddleware);
app.use(providerMiddleware);

// Register routes
app.use(routes);

// Error handling middleware
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
  logger.info(`Client running on port http://localhost:${PORT}`);
});
// app.listen(PORT, () => {
//     console.info(`Client Application listening on port ${PORT}`);
// });

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;