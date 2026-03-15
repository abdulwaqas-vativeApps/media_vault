import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ImageType } from "../../constants/constants.js";
import { ApiError } from "../../utils/ApiError.js";
import {s3} from "../../config/Aws.js";

/**
 * Generate presigned URL Service for media assets
 */
export const PresignedUrlService = async ({
  fileType,
  fileName,
  uploadFor,
}) => {
  console.log("fileType", fileType);
  console.log("fileName", fileName);
  console.log("uploadFor", uploadFor);
  const allowedAssetTypes = Object.values(ImageType);
  if (!allowedAssetTypes.includes(uploadFor)) {
    throw new ApiError(400, "Invalid uploadFor value");
  }

  const key = `${uploadFor}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60,
  });

  return {
    key,
    uploadUrl,
    cdnUrl: `${process.env.CDN_URL}/${key}`,
  };
};
