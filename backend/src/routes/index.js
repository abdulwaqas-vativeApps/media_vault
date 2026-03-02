import { Router } from "express";
import { SendResponse } from "../utils/ApiResponse.js";

const router = Router();

router.get("/health", (req, res) => {
  SendResponse(res, 200, "API is running");
});

export default router;