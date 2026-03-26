import { ApiError } from "../utils/ApiError.js";

/**
 * Middleware to authorize based on user roles
 */
export const RoleMiddleware = (...allowedRoles) => {
  return (req, res, next) => { 
    console.log("RoleMiddleware: Checking user role", req.user);
    console.log("allowedRoles", allowedRoles);
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "Forbidden: You do not have access to this resource");
    }
    next();
  };
};