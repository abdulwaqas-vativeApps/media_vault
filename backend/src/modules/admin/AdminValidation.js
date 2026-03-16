import Joi from "joi";

/**
 * Validation schema for params: userId
 */
export const UserStatusSchema = Joi.object({
  userId: Joi.string().required().messages({
    "string.empty": "User ID is required",
    "any.required": "User ID is required"
  }),
});