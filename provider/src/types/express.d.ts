import 'express';

// Extend Express Request interface to include our custom properties
declare global {
  namespace Express {
    interface Request {
      dbAvailable?: boolean;
      // Add other custom properties here as needed
    }
    
    interface Application {
      locals: {
        databaseAvailable?: boolean;
        reconnectAttempts?: number;
        dbReconnectionExhausted?: boolean;
        // Add other app-level properties here as needed
      }
    }
  }
}