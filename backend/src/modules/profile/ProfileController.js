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
