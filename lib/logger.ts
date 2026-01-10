import { isDevelopment } from '@/utils/variables';
import type { LoggerContext } from '@/types/AppErrors';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LoggerContext;
  error?: Error;
  timestamp: string;
}

class Logger {
  private formatMessage(entry: LogEntry): string {
    const { level, message, context, error, timestamp } = entry;
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    const errorStr = error
      ? `\nError: ${error.message}\nStack: ${error.stack}`
      : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}${errorStr}`;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: LoggerContext,
    error?: Error,
  ): void {
    const timestamp = new Date().toISOString();
    const entry: LogEntry = {
      level,
      message,
      context,
      error,
      timestamp,
    };

    if (isDevelopment) {
      const formatted = this.formatMessage(entry);
      switch (level) {
        case 'error':
          console.error(formatted);
          break;
        case 'warn':
          console.warn(formatted);
          break;
        case 'info':
          console.info(formatted);
          break;
        case 'debug':
          console.debug(formatted);
          break;
      }
    } else {
      // For now, only log errors in production
      if (level === 'error') {
        console.error(this.formatMessage(entry));
        // TODO: Integrate with external logging service (e.g., Sentry, LogRocket)
        // if (externalLogger) {
        //   externalLogger.captureException(error || new Error(message), { extra: context });
        // }
      }
    }
  }

  error(message: string, error?: Error, context?: LoggerContext): void {
    this.log('error', message, context, error);
  }

  warn(message: string, context?: LoggerContext): void {
    this.log('warn', message, context);
  }

  info(message: string, context?: LoggerContext): void {
    this.log('info', message, context);
  }

  debug(message: string, context?: LoggerContext): void {
    this.log('debug', message, context);
  }
}

export const logger = new Logger();
