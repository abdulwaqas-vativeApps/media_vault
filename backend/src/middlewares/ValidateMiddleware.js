import { ApiError } from "../utils/ApiError.js";

/**
 * Middleware to validate request data using Joi schemas
 * @param {Joi.Schema} schema - The Joi schema to validate against
 * @param {string} property - The request property to validate (default: "body")
 */
export const ValidateSchema = (schema, property = "body") => {
  return (req, res, next) => {
    console.log(" validateSchema");
    const joiRes = schema.validate(req[property]);

    const { error } = joiRes;

    console.log("error ===========>", error);

    if (error) {
      throw new ApiError(400, error.details[0].message);
    }

    next();
  };
};
