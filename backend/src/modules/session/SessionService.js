import prisma from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Get all sessions of a user
 */
export const GetUserSessionsService = async ({ userId }) => {

  const sessions = await prisma.sessions.findMany({
    where: { user_id: userId },
    orderBy: {
      created_at: "desc",
    },
  });

  if (!sessions || sessions.length === 0) {
    throw new ApiError(404, "No sessions found for this user");
  }

  return sessions;
};

/**
 * Revoke specific session of a user
 */
export const RevokeSessionService = async ({ userId, sessionId }) => {
  const session = await prisma.sessions.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.user_id !== userId) {
    throw new ApiError(404, "Session not found");
  }

  if (!session.is_active) {
    throw new ApiError(400, "Session is already inactive");
  }

  if (new Date() > session.expires_at) {
    throw new ApiError(400, "Session is already expired");
  }

  await prisma.sessions.update({
    where: { id: sessionId },
    data: {
      is_active: false,
    },
  });

  return true;
};

/**
 * Revoke all sessions of a user
 */
export const RevokeAllSessionsService = async ({ userId }) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const activeSessions = await prisma.sessions.findMany({
    where: {
      user_id: userId,
      is_active: true,
      expires_at: {
        gt: new Date(),
      },
    },
  });

  if (!activeSessions || activeSessions.length === 0) {
    throw new ApiError(400, "No active sessions found for this user");
  }

  await prisma.sessions.updateMany({
    where: {
      user_id: userId,
      is_active: true,
    },
    data: {
      is_active: false,
    },
  });

  return true;
};