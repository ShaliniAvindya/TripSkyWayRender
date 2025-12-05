import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 🟢 Create logger instance
const logger = winston.createLogger({
  levels,
  format: logFormat,
  transports: [],
});

// ---------------------------------------------------------------
// 🔥 VERCEL FIX
// Vercel filesystem is read-only → DO NOT use File transports.
// We detect Vercel using process.env.VERCEL or CI, etc.
// ---------------------------------------------------------------

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

// 🟡 Local development → allow file logs
if (!isVercel) {
  logger.add(
    new winston.transports.File({
      filename: path.join(dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: path.join(dirname, '../../logs/combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    })
  );
}

// 🟢 Console transport ALWAYS enabled (required on Vercel)
logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  })
);

// Morgan HTTP logger stream
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

export default logger;
