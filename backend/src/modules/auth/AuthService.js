import bcrypt from "bcryptjs";
import prisma from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { OAuth2Client } from "google-auth-library";
import { Provider } from "../../constants/roles.js";

/**
 * Handles user signup logic
 */
export const SignupService = async ({
  email,
  password,
  full_name,
  userAgent,
  ipAddress,
}) => {
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
      provider: Provider.Local,

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
      user_agent: userAgent || "unknown",
      ip_address: ipAddress || "unknown",
      expires_at: expiresAt,
    },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

/**
 * Handles Google authentication logic
 */
export const GoogleAuthService = async ({ idToken, userAgent, ipAddress }) => {
  const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  // Verify google token
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  const { email, name } = payload;

  if (!email) {
    throw new ApiError(400, "Google account email not found");
  }

  // Check if user already exists
  let user = await prisma.users.findUnique({
    where: { email },
    include: {
      role: true,
      profile: true,
    },
  });

  // If user does not exist → create user
  if (!user) {
    // Get default role
    const role = await prisma.roles.findUnique({
      where: { name: "Member" },
    });

    if (!role) {
      throw new ApiError(500, "Default role not found");
    }

    user = await prisma.users.create({
      data: {
        email,
        provider: Provider.Google,

        role: {
          connect: { id: role.id },
        },

        profile: {
          create: {
            full_name: name || "Google User",
          },
        },
      },
      include: {
        role: true,
        profile: true,
      },
    });
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role.name,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  // Session expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Create session
  await prisma.sessions.create({
    data: {
      user_id: user.id,
      refresh_token: refreshToken,
      user_agent: userAgent || "unknown",
      ip_address: ipAddress || "unknown",
      expires_at: expiresAt,
    },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};


/**
 * Login service
 */
export const LoginService = async ({ email, password, userAgent, ipAddress }) => {

  // Check if user exists
  const user = await prisma.users.findUnique({
    where: { email },
    include: {
      role: true,
      profile: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Ensure user registered via local provider
  if (user.provider === "Google" && !user.password) {
    throw new ApiError(400, "Please login using Google");
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role.name,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  // Refresh token expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Create session
  await prisma.sessions.create({
    data: {
      user_id: user.id,
      refresh_token: refreshToken,
      user_agent: userAgent || "unknown",
      ip_address: ipAddress || "unknown",
      expires_at: expiresAt,
    },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};
