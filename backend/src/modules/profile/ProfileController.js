import { ApiError } from "../../utils/ApiError.js";
import { SendResponse } from "../../utils/ApiResponse.js";
import * as ProfileService from "./ProfileService.js";

/**
 * Generate presigned URL for media assets
 */
export const PresignedUrlController = async (req, res, next) => {
  try {
    console.log("process.env.USE_CDN ",process.env.USE_CDN );
    // Local Upload Case
    if (process.env.USE_CDN === "false") {
      if (!req.file) {
        throw new ApiError(400, "No file provided");
      }

      const fileUrl = `${process.env.BACKEND_URL || "http://localhost:5000"}/uploads/${req.file.filename}`;

      return SendResponse(res, 200, "Image uploaded successfully", {
        uploadType: "local",
        key: req.file.filename,
        fileUrl,
      });
    }

    // CDN Upload Case
    console.log("req.body 2", req.body);
    const { asset_type, file_name, mime_type } = req.body;
    const result = await ProfileService.PresignedUrlService({
      fileType: mime_type,
      fileName: file_name,
      uploadFor: asset_type,
    });

    return SendResponse(res, 200, "Presigned URL generated successfully", {
      uploadType: "cdn",
      key: result.key,
      uploadUrl: result.uploadUrl,
      cdnUrl: result.cdnUrl,
    });

  } catch (error) {
    console.log("error", error);
    next(error);
  }

};

/**
 * Update Profile Controller
 */
export const UpdateProfileController = async (req, res, next) => {
  try {
    const {
      full_name,
      designation,
      contact_number,
      connect_me_for,
      company_name,
      password,
      media_assets
    } = req.body;

    const result = await ProfileService.UpdateProfileService({
      userId: req.user.userId,
      full_name,
      designation,
      contact_number,
      connect_me_for,
      company_name,
      password,
      media_assets,
    });

    return SendResponse(res, 200, "Profile updated successfully", result);
  } catch (error) {
    next(error);
  }
};


/**
 * Controller: Get currently logged-in user's profile
 * 
 * @param req.user.userId -> retrieved from AuthMiddleware
 * @returns user data including profile and media_assets
 */
export const GetMyProfileController = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Guard clause: Ensure userId exists
    if (!userId) {
      return next(new ApiError(400, "Invalid user session"));
    }

    // Call service to fetch user data
    const userData = await ProfileService.GetMyProfileService(userId);

    // Send successful response
    return SendResponse(res, 200, "User profile fetched successfully", userData);
  } catch (error) {
    console.log("GetMyProfileController", error);
    next(error); // Pass error to global error handler
  }
};