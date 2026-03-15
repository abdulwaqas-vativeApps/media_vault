import express from "express";
import { AuthMiddleware } from "../../middlewares/AuthMiddleware.js";
import { ValidateSchema } from "../../middlewares/ValidateMiddleware.js";
import * as ProfileValidation from "./ProfileValidation.js";
import * as ProfileController from "./ProfileController.js";
import { UploadMiddleware, UploadMemoryMiddleware } from "../../middlewares/UploadMiddleware.js";

const router = express.Router();

const conditionalUpload = (req, res, next) => {
  if (process.env.USE_CDN === "false") {
    return UploadMiddleware.single("image")(req, res, next);
  }
  // Parse multipart/form-data with memory storage to populate req.body when CDN is used
  return UploadMemoryMiddleware.single("image")(req, res, next);
};

const conditionalValidation = (req, res, next) => {
  if (process.env.USE_CDN !== "false") {
    return ValidateSchema(ProfileValidation.PresignedUrlSchema)(req, res, next);
  }
  console.log("conditionalValidation done");
  next();
};

router.post(
  "/media-assets/presigned-url",
  // AuthMiddleware,
  conditionalUpload,
  conditionalValidation,
  ProfileController.PresignedUrlController
);

export default router;
