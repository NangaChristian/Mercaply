export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface ILogger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, error?: Error | any, meta?: any): void;
  fatal(message: string, error?: Error | any, meta?: any): void;
}

export class EnterpriseLogger implements ILogger {
  private formatLog(level: LogLevel, message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...(data && { data }),
    };

    if (process.env.NODE_ENV === 'production') {
       console.log(JSON.stringify(logEntry));
    } else {
       console.log(`[${logEntry.timestamp}] [${logEntry.level}] ${message}`, data ? data : '');
    }
  }

  debug(message: string, meta?: any): void { this.formatLog('debug', message, meta); }
  info(message: string, meta?: any): void { this.formatLog('info', message, meta); }
  warn(message: string, meta?: any): void { this.formatLog('warn', message, meta); }
  error(message: string, error?: Error | any, meta?: any): void {
    this.formatLog('error', message, { error: error?.message || error, stack: error?.stack, ...meta });
  }
  fatal(message: string, error?: Error | any, meta?: any): void {
    this.formatLog('fatal', message, { error: error?.message || error, stack: error?.stack, ...meta });
  }
}

export const logger = new EnterpriseLogger();
