import express, { NextFunction, Response, Request } from "express";
import path from "path";
import cors from 'cors';
import morgan from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import favicon from 'serve-favicon';
import * as dotenv from 'dotenv';
import { errorMiddleware } from './middleware';
import { logger } from './utils';

// Import routes
import routes from "./routes";
import login from "./routes/login";
import logout from "./routes/logout";
import consent from "./routes/consent";
import device from "./routes/device";
import register from './routes/register';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// View engine setup
app.set('views', path.join(__dirname, '..', '/views'));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, '..', '/public')));
app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));

// Configure middleware
app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Register routes
app.use("/", routes);
app.use("/login", login);
app.use("/logout", logout);
app.use("/consent", consent);
app.use("/device", device);
app.use('/register', register);

// Catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new Error("Not Found"));
});

// Error handling middleware
if (app.get("env") === "development") {
  // Development error handler - will print stacktrace
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Development error:', err.message, err.stack);
    res.status(500);
    res.render("error", {
      message: err.message,
      error: err,
      pageTitle: "Authenticate | Error Page",
    });
  });
} else {
  // Production error handler - no stacktraces leaked to user
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Production error:', err.message);
    res.status(500);
    res.render("error", {
      message: err.message,
      error: {},
    });
  });
}

// Final error handler
app.use(errorMiddleware);

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