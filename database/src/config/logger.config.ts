type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export const loggerConfig = {
    level: (process.env.LOG_LEVEL || 'info') as LogLevel,
    enabled: process.env.NODE_ENV !== 'test',
    timestamp: true,
    prettifyLogs: process.env.NODE_ENV === 'development'
};

export const logger = {
    info: (message: string, ...args: any[]) => {
        if (loggerConfig.enabled) {
            console.log(`[INFO] ${message}`, ...args);
        }
    },
    error: (message: string, ...args: any[]) => {
        if (loggerConfig.enabled) {
            console.error(`[ERROR] ${message}`, ...args);
        }
    },
    warn: (message: string, ...args: any[]) => {
        if (loggerConfig.enabled) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    },
    debug: (message: string, ...args: any[]) => {
        if (loggerConfig.enabled && process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }
};