// Importing S3Client and PutObjectCommand from AWS SDK
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Importing getSignedUrl function from AWS SDK
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Importing AWSXRay module
import AWSXRay from 'aws-xray-sdk-core';

// Capturing S3 client with X-Ray
const s3 = AWSXRay.captureAWSv3Client(new S3Client());

// Getting S3 bucket name from environment variables
const s3bucket = process.env.TW_S3_BUCKET;

// Getting URL expiration time from environment variables
const urlExp = process.env.SIGNED_URL_EXPIRATION;

// Function to get signed URL for uploading
export async function getUploadUrl(imageId) {
  const command = new PutObjectCommand({
    Bucket: s3bucket,
    Key: imageId
  });
  const url = await getSignedUrl(s3, command, {
    expiresIn: urlExp
  });
  return url;
}
