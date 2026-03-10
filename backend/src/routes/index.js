import { Router } from "express";
import { SendResponse } from "../utils/ApiResponse.js";

// Import module-specific routers 
import authRoutes from "../modules/auth/AuthRoutes.js";


const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  SendResponse(res, 200, "API is running");
});

// Module Routers
router.use("/auth", authRoutes);      // /api/auth/* routes


export default router;