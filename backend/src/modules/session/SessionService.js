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