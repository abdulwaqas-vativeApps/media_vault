import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "./ApiError.js";

/** 
 * Generate short-lived access token for API auth
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN });
};

/** 
 * Generate long-lived refresh token for renewing access token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN });
};

/** 
 * Verify token and return decoded payload, throws if invalid/expired
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401,"Invalid or expired token");
  }
};