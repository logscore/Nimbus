import { CreateBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { S3Provider } from "../s3-provider";

const config = {
	endpoint: "http://localhost:9000",
	region: "us-east-1",
	accessKeyId: "minioadmin",
	secretAccessKey: "minioadmin",
	forcePathStyle: true, // Required for local S3 docker container
};

// Create S3 client
const createLocalS3Client = () => {
	return new S3Client({
		endpoint: config.endpoint,
		region: config.region,
		credentials: {
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey,
		},
		forcePathStyle: config.forcePathStyle,
	});
};

// Setup test bucket
export const setupTestBucket = async (bucketName: string) => {
	const s3Client = createLocalS3Client();

	try {
		await s3Client.send(
			new CreateBucketCommand({
				Bucket: bucketName,
			})
		);
	} catch (error) {
		// Bucket might already exist, which is fine
		console.log(`Test bucket '${bucketName}' already exists or error:`, error);
	}
};

// Cleanup test bucket
export const cleanupTestBucket = async (bucketName: string) => {
	const s3Client = createLocalS3Client();

	try {
		// List all objects in the bucket
		const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
		const listResponse = await s3Client.send(
			new ListObjectsV2Command({
				Bucket: bucketName,
			})
		);

		// Delete all objects
		if (listResponse.Contents && listResponse.Contents.length > 0) {
			const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");

			for (const object of listResponse.Contents) {
				if (object.Key) {
					await s3Client.send(
						new DeleteObjectCommand({
							Bucket: bucketName,
							Key: object.Key,
						})
					);
				}
			}
		}

		// Delete the bucket
		const { DeleteBucketCommand } = await import("@aws-sdk/client-s3");
		await s3Client.send(
			new DeleteBucketCommand({
				Bucket: bucketName,
			})
		);
	} catch (error) {
		console.log(`Error cleaning up test bucket:`, error);
	}
};

/**
 * Creates an S3Provider instance
 */
export function createTestS3Provider(bucketName: string): S3Provider {
	return new S3Provider({
		accessKeyId: config.accessKeyId,
		secretAccessKey: config.secretAccessKey,
		region: config.region,
		bucketName,
		endpoint: config.endpoint,
		forcePathStyle: config.forcePathStyle,
	});
}

/**
 * Generates a unique test file name
 */
export function generateTestFileName(prefix = "test") {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Cleans up test files created during testing
 */
export async function cleanupTestFiles(s3Provider: S3Provider, fileIds: string[]) {
	const cleanupPromises = fileIds.map(async fileId => {
		try {
			await s3Provider.delete(fileId);
		} catch (error) {
			console.warn(`Failed to cleanup test file ${fileId}:`, error);
		}
	});

	await Promise.all(cleanupPromises);
}
