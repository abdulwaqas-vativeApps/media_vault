import express from "express";
import { signupController } from "./AuthController.js";
import { ValidateSchema } from "../../middlewares/ValidateMiddleware.js";
import { SignupSchema } from "./AuthValidation.js";

const router = express.Router();

/**
 * POST /api/auth/signup
 * Create new user account
 */
router.post(
  "/signup",
  ValidateSchema(SignupSchema),
  signupController
);

export default router;