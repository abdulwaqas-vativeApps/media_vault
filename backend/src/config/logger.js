import winston from "winston";

/**
 * Create logger instance
 */
const logger = winston.createLogger({
  level: "info", // minimum log level

  format: winston.format.combine(
    winston.format.timestamp(), // add time
    winston.format.errors({ stack: true }), // include stack trace
    winston.format.json() // output in JSON format
  ),

  transports: [
    /**
     * Console log (for development)
     */
    new winston.transports.Console(),

    /**
     * Save only errors in file
     */
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),

    /**
     * Save all logs
     */
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

export default logger;