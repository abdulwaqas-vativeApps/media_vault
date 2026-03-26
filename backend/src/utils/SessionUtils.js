import prisma from "../config/prisma.js";

export const ExpireUserSessions = async (userId) => {
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
