type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMessage {
  message: string;
  level: LogLevel;
  timestamp: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  private formatMessage(level: LogLevel, message: string, meta: object = {}): LogMessage {
    return {
      message,
      level,
      timestamp: new Date().toISOString(),
      ...meta,
    };
  }

  private log(level: LogLevel, message: string, meta: object = {}) {
    const formattedMessage = this.formatMessage(level, message, meta);

    // Development logging
    if (this.isDevelopment) {
      const consoleMethod = level === "error" ? "error" : level === "warn" ? "warn" : "log";
      console[consoleMethod](
        `[${formattedMessage.timestamp}] ${level.toUpperCase()}: ${message}`,
        Object.keys(meta).length ? meta : ""
      );
      return;
    }

    // Production logging
    // In production, we only log warnings and errors
    if (level === "error" || level === "warn") {
      console[level](JSON.stringify(formattedMessage));
    }
  }

  debug(message: string, meta: object = {}) {
    if (this.isDevelopment) {
      this.log("debug", message, meta);
    }
  }

  info(message: string, meta: object = {}) {
    this.log("info", message, meta);
  }

  warn(message: string, meta: object = {}) {
    this.log("warn", message, meta);
  }

  error(message: string, error?: Error | unknown, meta: object = {}) {
    const errorMeta = error instanceof Error ? {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      ...meta,
    } : meta;

    this.log("error", message, errorMeta);
  }
}

export const logger = new Logger(); 