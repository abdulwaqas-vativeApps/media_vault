import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ImageType, Provider } from "../../constants/constants.js";
import { ApiError } from "../../utils/ApiError.js";
import { s3, cloudFront } from "../../config/Aws.js";
import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";
import {
  DeleteFromS3,
  BulkDeleteFromS3,
  InvalidateCloudFront,
  BulkInvalidateCloudFront,
} from "../../utils/AwsUtils.js";
import env from "../../config/env.js";

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

  console.log("env.S3_BUCKET_NAME ++++++++++++++++++++++++", env.S3_BUCKET_NAME);

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60,
  });

  return {
    key,
    uploadUrl,
    cdnUrl: `${env.CDN_URL}/${key}`,
  };
};

/**
 * Update Profile Service
 */
export const UpdateProfileService = async ({
  userId,
  full_name,
  designation,
  contact_number,
  connect_me_for,
  company_name,
  password,
  media_assets,
}) => {


  // --- Step 4: Identify media assets to delete from S3 ---
  const keysToDelete = [];
  if (media_assets && media_assets.length > 0) {
    // Fetch existing assets for the user before any changes
    const existingAssets = await prisma.media_assets.findMany({
      where: { user_id: userId },
    });

    for (const newAsset of media_assets) {
      const oldAsset = existingAssets.find(
        (a) => a.asset_type === newAsset.asset_type
      );

      // Only delete if the S3 key has changed (per requirement)
      if (oldAsset && oldAsset.s3_key !== newAsset.s3_key) {
        keysToDelete.push(oldAsset.s3_key);
      }
    }
  }

  //  Start Prisma transaction
  const updatedUser = await prisma.$transaction(async (tx) => {
    // --- Step 1: Check if user exists ---
    const existingUser = await tx.users.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    // --- Step 2: Update password if provided ---
    if (
      existingUser.provider === Provider.Google &&
      !existingUser.password &&
      !password
    ) {
      throw new ApiError(400, "Password is required for Google signing users");
    } else if (
      existingUser.provider === Provider.Google &&
      !existingUser.password &&
      password
    ) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await tx.users.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    }

    // --- Step 3: Upsert profile ---
    await tx.profiles.upsert({
      where: { user_id: userId },
      update: {
        full_name,
        designation,
        contact_number,
        connect_me_for,
        company_name,
      },
      create: {
        user_id: userId,
        full_name,
        designation,
        contact_number,
        connect_me_for,
        company_name,
      },
    });

    console.log("user updated ++++++++++++++++++++");

    // --- Step 5: Handle media assets (DB update) ---
    if (media_assets && media_assets.length > 0) {
      for (const asset of media_assets) {
        // Delete existing asset of the same type from DB
        await tx.media_assets.deleteMany({
          where: {
            user_id: userId,
            asset_type: asset.asset_type,
          },
        });

        // Add new asset
        await tx.media_assets.create({
          data: {
            user_id: userId,
            asset_type: asset.asset_type,
            s3_key: asset.s3_key,
            cdn_url: asset.cdn_url,
            mime_type: asset.mime_type,
          },
        });

        console.log("media asset updated in DB ++++++++++++++++++++");
      }
    }

    // --- Step 6: Fetch updated user to return ---
    const user = await tx.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        provider: true,
        status: true,
        profile: true,
        media_assets: true,
        role: true,
      },
    });

    console.log("user fetched ++++++++++++++++++++");

    return user;
  });

  // --- Step 7: Handle S3 and CloudFront side-effects (Bulk) ---
  if (keysToDelete.length > 0) {
    try {
      console.log("Performing bulk cleanup for keys:", keysToDelete);
      await BulkDeleteFromS3(keysToDelete);
      await BulkInvalidateCloudFront(keysToDelete);
    } catch (err) {
      console.error("Bulk S3 / CloudFront operation failed:", err);
      // Logging only — do not break the response as DB update was successful
    }
  }

  return updatedUser;
};

/**
 * Service: Fetch user profile by userId
 * Includes profile, media assets, and role
 *
 * @param {string} userId
 * @returns {object} user data
 */
export const GetMyProfileService = async (userId) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        provider: true,
        status: true,
        profile: true,
        media_assets: true,
        role: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw error; // Let controller handle error
  }
};
