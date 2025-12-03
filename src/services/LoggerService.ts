/**
 * Logger Service - Centralized logging with environment-based log levels
 *
 * Usage:
 * import { logger } from './services/LoggerService';
 *
 * logger.debug('Debug message', { data });
 * logger.info('Info message');
 * logger.warn('Warning message');
 * logger.error('Error message', error);
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

interface LoggerConfig {
  level: LogLevel;
  enableColors: boolean;
  enableTimestamps: boolean;
}

class LoggerService {
  private config: LoggerConfig;

  constructor() {
    // Determine log level from environment
    const envLogLevel = this.getEnvLogLevel();

    this.config = {
      level: envLogLevel,
      enableColors: true,
      enableTimestamps: true,
    };
  }

  private getEnvLogLevel(): LogLevel {
    // Check if we're in a Vite environment
    const isVite = typeof import.meta !== "undefined" && import.meta.env;

    if (isVite) {
      const envLevel = import.meta.env.VITE_LOG_LEVEL?.toLowerCase();
      const mode = import.meta.env.MODE;

      // In production mode, default to WARN unless explicitly set
      if (mode === "production" && !envLevel) {
        return LogLevel.WARN;
      }

      switch (envLevel) {
        case "debug":
          return LogLevel.DEBUG;
        case "info":
          return LogLevel.INFO;
        case "warn":
          return LogLevel.WARN;
        case "error":
          return LogLevel.ERROR;
        case "silent":
          return LogLevel.SILENT;
        default:
          return LogLevel.DEBUG; // Development default
      }
    }

    // For non-Vite environments (Capacitor/native), default to INFO
    return LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private formatMessage(
    level: string,
    message: string,
    ...args: unknown[]
  ): unknown[] {
    const timestamp = this.config.enableTimestamps
      ? `[${new Date().toISOString()}]`
      : "";

    const formattedMessage = `${timestamp} [${level}] ${message}`;

    return [formattedMessage, ...args];
  }

  /**
   * Log debug message (verbose, for development only)
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(...this.formatMessage("DEBUG", message, ...args));
    }
  }

  /**
   * Log informational message
   */
  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(...this.formatMessage("INFO", message, ...args));
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(...this.formatMessage("WARN", message, ...args));
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: unknown, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(...this.formatMessage("ERROR", message, error, ...args));
    }
  }

  /**
   * Create a logger with a specific context/namespace
   */
  withContext(context: string): ContextLogger {
    return new ContextLogger(this, context);
  }

  /**
   * Update logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current log level
   */
  getLogLevel(): LogLevel {
    return this.config.level;
  }
}

/**
 * Context-aware logger for adding namespace to log messages
 */
class ContextLogger {
  constructor(private logger: LoggerService, private context: string) {}

  debug(message: string, ...args: unknown[]): void {
    this.logger.debug(`[${this.context}] ${message}`, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.logger.info(`[${this.context}] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.logger.warn(`[${this.context}] ${message}`, ...args);
  }

  error(message: string, error?: unknown, ...args: unknown[]): void {
    this.logger.error(`[${this.context}] ${message}`, error, ...args);
  }
}

// Export singleton instance
export const logger = new LoggerService();

// Export context loggers for commonly used modules
export const authLogger = logger.withContext("Auth");
export const deviceLogger = logger.withContext("Device");
export const apiLogger = logger.withContext("API");
export const wsLogger = logger.withContext("WebSocket");
export const lightingLogger = logger.withContext("Lighting");
