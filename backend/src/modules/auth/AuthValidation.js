import Joi from "joi";

/**
 * Joi schema to validate signup request body
 */
export const SignupSchema = Joi.object({
  full_name: Joi.string()
    .min(3)
    .max(30)
    .required()
    .messages({
      "string.empty": "Full name is required",
      "string.min": "Full name should have at least 3 characters",
      "string.max": "Full name should have maximum 30 characters",
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Email must be valid",
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password should be at least 6 characters",
    }),
});