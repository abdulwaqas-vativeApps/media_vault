import Joi from "joi";
import { UserStatus } from "../../constants/constants.js";

/**
 * Joi schema to validate query params for /api/network
 */
export const NetworkListSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    "number.base": "Limit must be a number",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
  search: Joi.string().allow("").optional(),
  status: Joi.string()
    .valid(UserStatus.Active, UserStatus.Inactive, UserStatus.All)
    .default(UserStatus.All)
    .messages({
      "any.only": "Status must be one of Active, Inactive, or All",
    }),
});
