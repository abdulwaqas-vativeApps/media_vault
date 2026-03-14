import Joi from "joi";

/**
 * Validate userId param
 */
export const GetUserSessionsSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User id is required",
  }),
});

/**
 * Validate userId and sessionId params
 */
export const RevokeSessionSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User id is required",
  }),
  sessionId: Joi.string().required().messages({
    "any.required": "Session id is required",
  }),
});
