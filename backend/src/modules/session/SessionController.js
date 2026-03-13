import * as SessionService from "./SessionService.js";
import { SendResponse } from "../../utils/ApiResponse.js";

/**
 * Controller to get all sessions of a user
 */
export const GetUserSessionsController = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const sessions = await SessionService.GetUserSessionsService({
      userId,
    });

    return SendResponse(res, 200, "User sessions fetched successfully", sessions);
  } catch (error) {
    next(error);
  }
};