import { Router } from "express";
import * as SessionController from "./SessionController.js";
import { ValidateSchema } from "../../middlewares/ValidateMiddleware.js";
import { AuthMiddleware } from "../../middlewares/AuthMiddleware.js";
import * as SessionsSchema from "./SessionValidation.js";

const router = Router();

// api/sessions/

/**
 * Get all sessions of a user
 */
router.get(
  "/user/:userId",
  AuthMiddleware,
  ValidateSchema(SessionsSchema.GetUserSessionsSchema, "params"),
  SessionController.GetUserSessionsController,
);

export default router;
