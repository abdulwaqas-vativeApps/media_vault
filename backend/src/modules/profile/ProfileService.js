import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ImageType, Provider } from "../../constants/constants.js";
import { ApiError } from "../../utils/ApiError.js";
import { s3, cloudFront } from "../../config/Aws.js";
import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";

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
  // 1. Check if user exists
  const existingUser = await prisma.users.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  // 2. Update password if provided
  if (existingUser.provider === Provider.Google && !password) {
    throw new ApiError(400, "Password is required for Google users");
  } else if (existingUser.provider === Provider.Google && password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  // 3. Upsert profile
  await prisma.profiles.upsert({
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

  // 4. Handle media assets
  if (media_assets && media_assets.length > 0) {
    for (const asset of media_assets) {
      // Check for existing asset of the same type
      const existingAsset = await prisma.media_assets.findFirst({
        where: {
          user_id: userId,
          asset_type: asset.asset_type,
        },
      });

      if (existingAsset) {
        // Delete from S3
        if (existingAsset.s3_key) {
          try {
            const deleteCmd = new DeleteObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME,
              Key: existingAsset.s3_key,
            });
            await s3.send(deleteCmd);

            // Invalidate CloudFront if distribution ID exists
            if (process.env.CLOUDFRONT_DISTRIBUTION_ID) {
              const invalidationCmd = new CreateInvalidationCommand({
                DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
                InvalidationBatch: {
                  CallerReference: Date.now().toString(),
                  Paths: {
                    Quantity: 1,
                    Items: [`/${existingAsset.s3_key}`],
                  },
                },
              });
              await cloudFront.send(invalidationCmd);
            }
          } catch (err) {
            console.error("Failed to delete from S3/CDN:", err);
            // Optionally log and continue without throwing so DB continues updating
          }
        }

        // Delete from DB
        await prisma.media_assets.delete({
          where: { id: existingAsset.id },
        });
      }

      // Add new asset
      await prisma.media_assets.create({
        data: {
          user_id: userId,
          asset_type: asset.asset_type,
          s3_key: asset.s3_key,
          cdn_url: asset.cdn_url,
          mime_type: asset.mime_type
        },
      });
    }
  }

  // Fetch updated user with profile and media assets to return
  const updatedUser = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      provider: true,
      profile: true,
      media_assets: true,
      role: true
    },
  });

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
