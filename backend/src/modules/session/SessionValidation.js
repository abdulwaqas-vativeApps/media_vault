import Joi from "joi";

/**
 * Validate userId param
 */
export const GetUserSessionsSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User id is required",
  }),
});
