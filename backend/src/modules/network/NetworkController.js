import * as NetworkService from "./NetworkService.js";
import { SendResponse } from "../../utils/ApiResponse.js";

/**
 * Controller to get paginated list of network users
 */
export const GetNetworkUsersController = async (req, res, next) => {
  try {
    // Extract query parameters
    const { page, limit, search, status } = req.query;

    // Call service to fetch filtered & paginated users
    const result = await NetworkService.GetNetworkUsersService({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      status,
    });

    return SendResponse(res, 200, "Network users fetched successfully", result);
  } catch (error) {
    next(error);
  }
};