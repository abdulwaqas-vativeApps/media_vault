import Joi from "joi";
import { ImageType } from "../../constants/constants.js";

const allowedAssetTypes = Object.values(ImageType);
/**
 * Validate presigned url schema
 */
export const PresignedUrlSchema = Joi.object({
    asset_type: Joi.string()
      .valid(...allowedAssetTypes)
      .required()
      .messages({
        "any.only": `asset_type must be one of the following: ${allowedAssetTypes.join(", ")}`,
        "any.required": "asset_type is a required field",
        "string.empty": "asset_type cannot be an empty field"
      }),
    file_name: Joi.string()
      .required()
      .messages({
        "any.required": "file_name is a required field",
        "string.empty": "file_name cannot be an empty field"
      }),
    mime_type: Joi.string()
      .required()
      .messages({
        "any.required": "mime_type is a required field",
        "string.empty": "mime_type cannot be an empty field"
      })
  });
