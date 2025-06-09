import { Request, Response, NextFunction } from 'express';
import { GenericLogger } from 'reef-framework';

// ANSI color codes
const COLORS = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  underline: '\x1b[4m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m'
};

// Create a custom logger implementation
export class CustomLogger implements GenericLogger {
  private formatTimestamp(): string {
    const now = new Date();
    return now.toTimeString().split(' ')[0]; // Returns HH:MM:SS
  }

  private formatLevel(level: string): string {
    const colors = {
      debug: COLORS.gray,
      info: COLORS.green,
      warn: COLORS.yellow,
      error: COLORS.red
    };
    return `${colors[level as keyof typeof colors]}[${level.toUpperCase()}]${COLORS.reset}`;
  }

  private formatError(error: Error): string {
    if (!error.stack) return error.message;
    
    // Split the stack trace into lines
    const lines = error.stack.split('\n');
    
    // Format each line
    return lines.map((line, index) => {
      if (index === 0) {
        // First line (error message) in red
        return `${COLORS.red}${line}${COLORS.reset}`;
      }
      
      // File paths in blue and underlined
      const formattedLine = line.replace(/(\/[^\s:]+:\d+:\d+)/g, `${COLORS.blue}${COLORS.underline}$1${COLORS.reset}`);
      
      // Function names in cyan
      return formattedLine.replace(/at\s+([^\s(]+)/g, `at ${COLORS.cyan}$1${COLORS.reset}`);
    }).join('\n');
  }

  private formatMessage(args: unknown[]): string {
    return args.map(arg => {
      if (arg instanceof Error) {
        return this.formatError(arg);
      }
      if (typeof arg === 'object' && arg !== null) {
        // Handle error objects in the error handler
        if ('error' in arg && arg.error instanceof Error) {
          return this.formatError(arg.error);
        }
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          // If JSON.stringify fails (e.g., due to circular references),
          // return a simplified version of the object
          return '[Object with circular references]';
        }
      }
      return String(arg);
    }).join(' ');
  }

  debug(...args: unknown[]) {
    console.debug(`${this.formatTimestamp()} ${this.formatLevel('debug')} ${this.formatMessage(args)}`);
  }

  info(...args: unknown[]) {
    console.info(`${this.formatTimestamp()} ${this.formatLevel('info')} ${this.formatMessage(args)}`);
  }

  warn(...args: unknown[]) {
    console.warn(`${this.formatTimestamp()} ${this.formatLevel('warn')} ${this.formatMessage(args)}`);
  }

  error(...args: unknown[]) {
    console.error(`${this.formatTimestamp()} ${this.formatLevel('error')} ${this.formatMessage(args)}`);
  }
}

// Create request logger middleware
export const requestLogger = (logger: CustomLogger) => (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request with safe properties only
  logger.info(`${req.method} ${req.url}`, {
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      'accept': req.headers['accept'],
      'host': req.headers['host']
    },
    query: req.query,
    body: req.body
  });

  // Log response
  const oldSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    return oldSend.apply(res, [data]);
  };

  next();
};

// Create error handler middleware
export const errorHandler = (logger: CustomLogger) => (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });
  
  if (!res.headersSent) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
}; 