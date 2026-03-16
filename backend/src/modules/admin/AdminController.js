import * as AdminService from "./admin.service.js";
import { SendResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Controller: Toggle user status (ACTIVE <-> INACTIVE)
 * Only Admin can perform this action
 * 
 * @param req.params.userId - Target user ID
 * @returns Updated user status
 */
export const ToggleUserStatusController = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Call service to toggle user status
    const updatedUser = await AdminService.ToggleUserStatusService(userId);

    return SendResponse(res, 200, "User status updated successfully", updatedUser);
  } catch (error) {
    next(error); // Pass to global error handler
  }
};