import { ApiError } from "../utils/ApiError";

/**
 * Middleware to authorize based on user roles
 */
export const AllowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "Forbidden: You do not have access to this resource");
    }
    next();
  };
};