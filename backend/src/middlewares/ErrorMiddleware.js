import logger from "../config/logger.js";

/**
 * Global Error Middleware
 */
export const GlobalErrorHandler = (err, req, res, next) => {
  console.log('====================================');
  console.log("error come", err.message);
  console.log('====================================');
  /**
   * Log error details
   */
  logger.error({
    message: err.message,
    stack: err.stack,

    // request info
    route: req.originalUrl,
    method: req.method,
    ip: req.ip,

    // optional user info
    userId: req.user?.id || null,
  });

  /**
   * Send response
   */
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};