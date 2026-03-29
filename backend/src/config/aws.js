import { S3Client } from "@aws-sdk/client-s3";
import { CloudFrontClient } from "@aws-sdk/client-cloudfront";
import env from "./env.js";

console.log(".env load ++++++++++++++++++++++++++++++++",env.AWS_REGION);


export const s3 = new S3Client({
  region: env.AWS_REGION,

  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});
export const cloudFront = new CloudFrontClient({
  region: env.AWS_REGION,
});
