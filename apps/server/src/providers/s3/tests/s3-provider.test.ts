import { describe, expect, it } from "vitest";
import { S3Provider } from "../s3-provider";

describe("S3Provider", () => {
	const mockConfig = {
		accessKeyId: "test-access-key",
		secretAccessKey: "test-secret-key",
		region: "us-east-1",
		bucketName: "test-bucket",
	};

	describe("Constructor", () => {
		it("should create S3Provider with correct config", () => {
			const s3Provider = new S3Provider(mockConfig);
			expect(s3Provider).toBeInstanceOf(S3Provider);
			// The token is base64 encoded with a timestamp, so we decode it to check.
			const decodedToken = Buffer.from(s3Provider.getAccessToken(), "base64").toString("utf-8");
			expect(decodedToken).toContain(mockConfig.accessKeyId);
		});

		it("should handle custom endpoint", () => {
			const providerWithEndpoint = new S3Provider({
				...mockConfig,
				endpoint: "https://minio.example.com",
			});
			expect(providerWithEndpoint).toBeInstanceOf(S3Provider);
		});

		it("should throw an error if region is missing", () => {
			expect(() => {
				new S3Provider({
					accessKeyId: "",
					secretAccessKey: "",
					region: "", // AWS SDK requires a region
					bucketName: "",
				});
			}).toThrow();
		});
	});

	describe("Authentication Interface", () => {
		it("should get access token and reject token updates", () => {
			const s3Provider = new S3Provider(mockConfig);
			const originalToken = s3Provider.getAccessToken();

			expect(typeof originalToken).toBe("string");
			expect(originalToken.length).toBeGreaterThan(0);

			// S3Provider should reject dynamic token updates for security
			expect(() => {
				s3Provider.setAccessToken("new-token");
			}).toThrow("S3Provider does not support dynamic credential updates");
		});
	});

	describe("S3-Compatible Services", () => {
		it("should support MinIO configuration", () => {
			const minioProvider = new S3Provider({
				accessKeyId: "minio-key",
				secretAccessKey: "minio-secret",
				region: "us-east-1",
				bucketName: "test-bucket",
				endpoint: "http://localhost:9000",
			});
			expect(minioProvider).toBeInstanceOf(S3Provider);
		});
	});
});
