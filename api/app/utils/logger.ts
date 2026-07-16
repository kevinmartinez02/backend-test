import winston from "winston";
import morgan, { type StreamOptions } from "morgan";

// Define log severity levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Set the log level based on the current environment
const level = (): string => {
  const env = process.env.NODE_ENV || "development";
  return env === "development" ? "debug" : "warn";
};

// Define colors for each log level (useful for console output)
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// Configure the log formatting (sin color: es el formato base para archivos)
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level}]: ${info.message}`,
  ),
);

// Define where the logs should be stored/sent
// El color solo va en la consola; en los archivos quedarían códigos ANSI ilegibles
const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      format,
    ),
  }),
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
  }),
  new winston.transports.File({ filename: "logs/combined.log" }),
];

// Initialize the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// Link Morgan logging stream to our Winston HTTP profile
const stream: StreamOptions = {
  write: (message) => logger.http(message.trim()),
};

// Skip HTTP logging if the application is not running in development mode
const skip = () => {
  const env = process.env.NODE_ENV || "development";
  return env !== "development";
};

// Build the morgan middleware
const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip },
);

export { morganMiddleware, logger };
