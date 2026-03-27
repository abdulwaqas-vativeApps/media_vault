import prisma from "../../config/prisma.js";
import { UserStatus } from "../../constants/constants.js";

/**
 * Service to fetch paginated users for network directory
 */
export const GetNetworkUsersService = async ({
  page,
  limit,
  search,
  status,
}) => {
  const skip = (page - 1) * limit;

  // Build dynamic filter conditions
  const filters = {
    ...(status !== UserStatus.All && { status }),
    OR: search
      ? [
          { profile: { full_name: { contains: search, mode: "insensitive" } } },
          { email: { contains: search, mode: "insensitive" } },
          {
            profile: { designation: { contains: search, mode: "insensitive" } },
          },
          {
            profile: {
              company_name: { contains: search, mode: "insensitive" },
            },
          },
        ]
      : undefined,
  };

  // Fetch total count for pagination
  const total = await prisma.users.count({
    where: filters,
  });

  // Fetch paginated users
  const users = await prisma.users.findMany({
    where: filters,
    skip,
    take: limit,
    select: {
      id: true,
      email: true,
      status: true,
      profile: true,
      media_assets: true,
      role: true,
    },
    orderBy: {
      profile: {
        full_name: "asc",
      },
    },
  });

  return {
    page,
    limit,
    total,
    users,
  };
};
