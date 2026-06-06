import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "$env/dynamic/private";

const PUBLIC_ENDPOINT = process.env.S3_PUBLIC_ENDPOINT || env.S3_PUBLIC_ENDPOINT;
const ENDPOINT = env.S3_ENDPOINT || process.env.S3_ENDPOINT;

export const s3 = new S3Client({
	region: env.S3_REGION || "us-east-1",
	endpoint: ENDPOINT,
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY || "admin",
		secretAccessKey: env.S3_SECRET_KEY || "admin123"
	},
	forcePathStyle: true // Required for MinIO
});

export const s3Presign = new S3Client({
	region: env.S3_REGION || "us-east-1",
	endpoint: PUBLIC_ENDPOINT || ENDPOINT,
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY || "admin",
		secretAccessKey: env.S3_SECRET_KEY || "admin123"
	},
	forcePathStyle: true // Required for MinIO
});

export const BUCKET_NAME = env.S3_BUCKET_NAME || "drive-files";

export async function generateUploadUrl(key: string, contentType: string) {
	const command = new PutObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
		ContentType: contentType
	});
	// URL expires in 15 minutes
	return getSignedUrl(s3Presign, command, { expiresIn: 900 });
}

export async function generateDownloadUrl(key: string) {
	const command = new GetObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key
	});
	// URL expires in 1 hour
	return getSignedUrl(s3Presign, command, { expiresIn: 3600 });
}

export async function deleteS3Object(key: string) {
	const command = new DeleteObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key
	});
	await s3.send(command);
}
