import bcrypt from "bcryptjs";
import prisma from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";

/**
 * Handles user signup logic
 */
export const signupService = async ({
  email,
  password,
  full_name,
  userAgent,
  ipAddress,
}) => {
  console.log(" email, password, full_name , userAgent, ipAddress ");
  console.log(email, password, full_name, userAgent, ipAddress);

  // Check if email already exists
  const existingUser = await prisma.users.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, "Email already exists");
  }

  // Hash user password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  // Get default role (Member)
  const role = await prisma.roles.findUnique({
    where: { name: "Member" },
  });

  if (!role) {
    throw new ApiError(500, "Default role not found");
  }

  // Create user and profile in single transaction
  const user = await prisma.users.create({
    data: {
      email,
      password: hashedPassword,
      provider: "Local",

      role: {
        connect: { id: role.id },
      },

      profile: {
        create: {
          full_name,
        },
      },
    },
    include: {
      role: true,
      profile: true,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role.name,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // create session with refresh token
  await prisma.sessions.create({
    data: {
      user_id: user.id,
      refresh_token: refreshToken,
      user_agent: userAgent,
      ip_address: ipAddress,
      expires_at: expiresAt,
    },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};
