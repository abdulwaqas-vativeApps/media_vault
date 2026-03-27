import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ImageType, Provider } from "../../constants/constants.js";
import { ApiError } from "../../utils/ApiError.js";
import { s3, cloudFront } from "../../config/Aws.js";
import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";
import { DeleteFromS3, InvalidateCloudFront } from "../../utils/AwsUtils.js";

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
  // Store hashed password (if provided)
  let hashedPassword = null;

  //  Start Prisma transaction
  const updatedUser = await prisma.$transaction(
    async (tx) => {

    // --- Step 1: Check if user exists ---
    const existingUser = await tx.users.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    // --- Step 2: Update password if provided ---
    if (existingUser.provider === Provider.Google && !existingUser.password && !password) {
      throw new ApiError(400, "Password is required for Google signing users");
    } else if (existingUser.provider === Provider.Google && !existingUser.password && password) {
      hashedPassword = await bcrypt.hash(password, 10);
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
        password: hashedPassword ? hashedPassword : existingUser.password, // Update password if new one provided
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

    // --- Step 4: Handle media assets (DB part only) ---
    if (media_assets && media_assets.length > 0) {
      for (const asset of media_assets) {
        // Check for existing asset of the same type
        const existingAsset = await tx.media_assets.findFirst({
          where: {
            user_id: userId,
            asset_type: asset.asset_type,
          },
        });

        // If existing asset found, delete from DB (S3 handled later)
        if (existingAsset) {
          await tx.media_assets.delete({
            where: { id: existingAsset.id },
          });
        }

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
      }
    }

    // --- Step 5: Fetch updated user to return ---
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

    return user;
  });

  // --- Step 6: Handle S3 and CloudFront side-effects outside transaction ---
  if (media_assets && media_assets.length > 0) {
    for (const asset of media_assets) {
      try {
        // Delete existing files & invalidate CDN
        const existingAsset = await prisma.media_assets.findFirst({
          where: {
            user_id: userId,
            asset_type: asset.asset_type,
          },
        });

        if (existingAsset && existingAsset.s3_key) {
          await DeleteFromS3(existingAsset.s3_key);
          await InvalidateCloudFront(existingAsset.s3_key);
        }
      } catch (err) {
        console.error("S3 / CloudFront operation failed:", err);
        // Logging only — do not break main transaction
      }
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
