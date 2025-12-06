/**
 * Structured Logger
 * Provides consistent logging with proper log levels
 * In production, can be extended to send to external services (Sentry, DataDog, etc.)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// Log levels in order of severity
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Minimum log level based on environment
const MIN_LOG_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

function formatLog(entry: LogEntry): string {
  if (process.env.NODE_ENV === 'production') {
    // JSON format for production (easier to parse in log aggregators)
    return JSON.stringify(entry);
  }
  
  // Human-readable format for development
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  let message = `${prefix} ${entry.message}`;
  
  if (entry.context) {
    message += ` ${JSON.stringify(entry.context)}`;
  }
  
  if (entry.error) {
    message += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
    if (entry.error.stack && process.env.NODE_ENV === 'development') {
      message += `\n  ${entry.error.stack}`;
    }
  }
  
  return message;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
  if (!shouldLog(level)) return;
  
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };
  
  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  
  const formatted = formatLog(entry);
  
  switch (level) {
    case 'error':
      // In production, you would send to Sentry or similar here
      // eslint-disable-next-line no-console
      console.error(formatted);
      break;
    case 'warn':
      // eslint-disable-next-line no-console
      console.warn(formatted);
      break;
    case 'debug':
      // eslint-disable-next-line no-console
      console.debug(formatted);
      break;
    default:
      // eslint-disable-next-line no-console
      console.log(formatted);
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
  error: (message: string, error?: Error, context?: Record<string, unknown>) => log('error', message, context, error),
};

export default logger;

