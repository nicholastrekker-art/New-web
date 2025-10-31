
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private enabled: boolean = true;

  setLevel(level: LogLevel) {
    this.level = level;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private log(level: LogLevel, context: string, message: string, ...args: any[]) {
    if (!this.enabled || level < this.level) return;

    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];
    const prefix = `[${timestamp}] [${levelStr}] [${context}]`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, ...args);
        break;
      case LogLevel.INFO:
        console.info(prefix, message, ...args);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, ...args);
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, ...args);
        break;
    }
  }

  debug(context: string, message: string, ...args: any[]) {
    this.log(LogLevel.DEBUG, context, message, ...args);
  }

  info(context: string, message: string, ...args: any[]) {
    this.log(LogLevel.INFO, context, message, ...args);
  }

  warn(context: string, message: string, ...args: any[]) {
    this.log(LogLevel.WARN, context, message, ...args);
  }

  error(context: string, message: string, ...args: any[]) {
    this.log(LogLevel.ERROR, context, message, ...args);
  }
}

export const logger = new Logger();

// Enable debug logging in development
if (import.meta.env.DEV) {
  logger.setLevel(LogLevel.DEBUG);
}
