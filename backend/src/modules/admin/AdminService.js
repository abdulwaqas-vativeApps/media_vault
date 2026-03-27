import prisma from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { UserStatus } from "../../constants/constants.js";
import { ExpireUserSessions } from "../../utils/SessionUtils.js";
import { DeleteFromS3, InvalidateCloudFront } from "../../utils/AwsUtils.js";

/**
 * Service: Toggle user status
 */
export const ToggleUserStatusService = async (userId) => {
  // Fetch current user status
  const user = await prisma.users.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let updatedStatus;

  if (user.status === UserStatus.Active) {
    //  If currently ACTIVE, set to INACTIVE and revoke all sessions
    updatedStatus = UserStatus.Inactive;

    await prisma.users.update({
      where: { id: userId },
      data: { status: updatedStatus },
    });

    // Revoke all sessions of this user
    await ExpireUserSessions(userId);
  } else {
    //  If currently INACTIVE, set to ACTIVE (no session revocation needed)
    updatedStatus = UserStatus.Active;

    await prisma.users.update({
      where: { id: userId },
      data: { status: updatedStatus },
    });
  }

  //  Return updated status
  return { userId, status: updatedStatus };
};

/**
 * Service: Delete a user permanently
 * - Delete all media assets from S3 and clear CDN
 * - Delete profile
 * - Delete sessions
 * - Delete user
 *
 * @param {string} userId
 */
export const DeleteUserService = async (userId) => {
  // / Fetch user to ensure existence
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { media_assets: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // / Delete all media assets from S3 & clear CDN
  if (user.media_assets && user.media_assets.length > 0) {
    for (const media of user.media_assets) {
      // delete file from S3
      await DeleteFromS3(media.s3_key);

      // Invalidate CloudFront if distribution ID exists
      await InvalidateCloudFront(media.s3_key);
    }
  }


  // Delete profile (cascade deletion handled via Prisma relation)
  // Delete user
  await prisma.users.delete({
    where: { id: userId },
  });

  return;
};
