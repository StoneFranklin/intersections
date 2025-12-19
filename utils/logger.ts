/**
 * Logger utility that only logs in development mode.
 * Prevents console.log statements from appearing in production builds.
 */

const isDev = __DEV__;

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

function createLogger(level: LogLevel) {
  return (...args: unknown[]) => {
    if (isDev) {
      console[level](...args);
    }
  };
}

export const logger = {
  log: createLogger('log'),
  warn: createLogger('warn'),
  error: createLogger('error'),
  info: createLogger('info'),
  debug: createLogger('debug'),
};

// For critical errors that should always be logged (even in production)
export const criticalError = (...args: unknown[]) => {
  console.error(...args);
};
