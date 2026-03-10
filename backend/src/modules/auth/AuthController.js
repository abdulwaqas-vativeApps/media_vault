import { signupService } from "./AuthService.js";
import { SendResponse } from "../../utils/ApiResponse.js";

/**
 * Signup controller
 */
export const signupController = async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body;

    const result = await signupService({
      email,
      password,
      full_name,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    // Store refresh token in httpOnly cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return SendResponse(res, 201, "Signup successful", {
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};
