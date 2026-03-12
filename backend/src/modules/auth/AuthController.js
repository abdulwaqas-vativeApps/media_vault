import { SendResponse } from "../../utils/ApiResponse.js";
import * as AuthService from "./AuthService.js";

/**
 * Signup controller
 */
export const SignupController = async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body;

    const result = await AuthService.SignupService({
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

/** 
 *  Google authentication controller
 */
export const GoogleAuthController = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    const result = await AuthService.GoogleAuthService({
      idToken,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    // Store refresh token in cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return SendResponse(res, 200, "Google authentication successful", {
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Login controller
 */
export const LoginController = async (req, res, next) => {
  try {

    const { email, password } = req.body;

    const result = await AuthService.LoginService({
      email,
      password,
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

    return SendResponse(res, 200, "Login successful", {
      user: result.user,
      accessToken: result.accessToken,
    });

  } catch (error) {
    next(error);
  }
};