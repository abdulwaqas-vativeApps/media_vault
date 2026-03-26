import { s3, cloudFront } from "../config/Aws.js";
import { CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { ApiError } from "./ApiError.js";

export const DeleteFromS3 = async (s3Key) => {
  try {
    const deleteCmd = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
    });

    await s3.send(deleteCmd);
  } catch (err) {
    console.error("Failed to delete from S3:", err);
    throw new ApiError(500, "Failed to delete media asset from S3");
  }
};

export const InvalidateCloudFront = async (s3Key) => {
  try {
    if (process.env.CLOUDFRONT_DISTRIBUTION_ID) {
      const invalidationCmd = new CreateInvalidationCommand({
        DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
        InvalidationBatch: {
          CallerReference: Date.now().toString(),
          Paths: {
            Quantity: 1,
            Items: [`/${s3Key}`],
          },
        },
      });
      await cloudFront.send(invalidationCmd);
    }
  } catch (err) {
    console.error("Failed to invalidate CloudFront cache:", err);
    throw new ApiError(500, "Failed to invalidate CDN cache");
  }
};
