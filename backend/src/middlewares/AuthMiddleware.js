import { ApiError } from "../utils/ApiError.js";
import { verifyToken } from "../utils/jwt.js";

/**
 * Middleware to authenticate requests using JWT
 */
export const AuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    next(new ApiError(401, "Unauthorized: No token provided"));
  }

  try {
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    next(new ApiError(401, error.message || "Unauthorized: Invalid token"));
  }
};
