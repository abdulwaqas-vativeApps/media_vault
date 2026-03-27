import express from "express";
import * as NetworkController from "./NetworkController.js";
import { ValidateSchema } from "../../middlewares/ValidateMiddleware.js";
import { NetworkListSchema } from "./NetworkValidation.js";
import { AuthMiddleware } from "../../middlewares/AuthMiddleware.js";

const router = express.Router();

/**
 * GET /api/network
 * Fetch paginated network users
 */
router.get(
  "/",
  AuthMiddleware,
  ValidateSchema(NetworkListSchema, "query"),
  NetworkController.GetNetworkUsersController
);

export default router;