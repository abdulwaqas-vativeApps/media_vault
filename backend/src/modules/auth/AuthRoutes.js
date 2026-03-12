import express from "express";
import * as AuthController from "./AuthController.js";
import * as AuthSchema from "./AuthValidation.js";
import { ValidateSchema } from "../../middlewares/ValidateMiddleware.js";

const router = express.Router();

// api/auth/

/**
 * Create new user account
 */
router.post(
  "/signup",
  ValidateSchema(AuthSchema.SignupSchema),
  AuthController.SignupController,
);

/**
 * Authenticate user with Google
 */
router.post(
  "/google",
  ValidateSchema(AuthSchema.GoogleAuthSchema),
  AuthController.GoogleAuthController,
);

/**
 * Login route
 */
router.post(
  "/login",
  ValidateSchema(AuthSchema.LoginSchema),
  AuthController.LoginController,
);

/**
 * Get new access token using refresh token
 */
router.post("/refresh-token", AuthController.RefreshTokenController);

export default router;
