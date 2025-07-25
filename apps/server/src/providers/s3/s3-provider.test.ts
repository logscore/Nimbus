// Simple Node.js test file for S3Provider
// Since the project doesn't have a testing framework configured yet,
// this provides basic validation of the S3Provider class
// TODO: Project's CONTRIBUTING.md indicates Vitest should be used for backend testing,
// but no testing framework is currently configured. Consider setting up Vitest for
// better error reporting, test isolation, and IDE integration.

import { S3Provider } from "./s3-provider";

console.log("🧪 Running S3Provider Unit Tests...\n");

function assert(condition: boolean, message: string) {
	if (!condition) {
		throw new Error(`Assertion failed: ${message}`);
	}
	console.log(`✅ ${message}`);
}

function test(name: string, fn: () => void | Promise<void>) {
	try {
		const result = fn();
		if (result instanceof Promise) {
			return result
				.then(() => {
					console.log(`✅ ${name}`);
				})
				.catch(error => {
					console.error(`❌ ${name}: ${error.message}`);
					throw error;
				});
		} else {
			console.log(`✅ ${name}`);
		}
	} catch (error) {
		console.error(`❌ ${name}: ${(error as Error).message}`);
		throw error;
	}
}

async function runTests() {
	const mockConfig = {
		accessKeyId: "test-access-key",
		secretAccessKey: "test-secret-key",
		region: "us-east-1",
		bucketName: "test-bucket",
	};

	console.log("📝 Testing S3Provider Constructor...");

	await test("should create S3Provider with correct config", () => {
		const s3Provider = new S3Provider(mockConfig);
		assert(s3Provider instanceof S3Provider, "S3Provider instance created");
		assert(s3Provider.getAccessToken() === "test-access-key:test-secret-key", "Access token formatted correctly");
	});

	await test("should handle custom endpoint", () => {
		const providerWithEndpoint = new S3Provider({
			...mockConfig,
			endpoint: "https://minio.example.com",
		});
		assert(providerWithEndpoint instanceof S3Provider, "S3Provider with custom endpoint created");
	});

	console.log("\n📝 Testing Private Methods (via public interface)...");

	await test("should handle empty configuration gracefully", () => {
		const emptyProvider = new S3Provider({
			accessKeyId: "",
			secretAccessKey: "",
			region: "",
			bucketName: "",
		});
		assert(emptyProvider instanceof S3Provider, "S3Provider handles empty config");
	});

	console.log("\n📝 Testing Authentication Interface...");

	await test("should get access token and reject token updates", () => {
		const s3Provider = new S3Provider(mockConfig);
		const originalToken = s3Provider.getAccessToken();
		assert(typeof originalToken === "string" && originalToken.length > 0, "Access token is valid string");

		// S3Provider should reject dynamic token updates for security
		try {
			s3Provider.setAccessToken("new-token");
			assert(false, "setAccessToken should throw an error");
		} catch (error) {
			assert(error instanceof Error, "Should throw proper error");
			assert(
				(error as Error).message.includes("does not support dynamic credential updates"),
				"Should have correct error message"
			);
		}
	});

	console.log("\n📝 Testing S3-Compatible Services...");

	await test("should support MinIO configuration", () => {
		const minioProvider = new S3Provider({
			accessKeyId: "minio-key",
			secretAccessKey: "minio-secret",
			region: "us-east-1",
			bucketName: "test-bucket",
			endpoint: "http://localhost:9000",
		});
		assert(minioProvider instanceof S3Provider, "MinIO-compatible provider created");
	});

	console.log("\n🎉 All S3Provider unit tests passed!");
	console.log("📝 Note: Integration tests require real S3 credentials");
	console.log("   Run the files in __tests__/ directory for full testing");
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	runTests().catch(error => {
		console.error("\n❌ Test suite failed:", error.message);
		process.exit(1);
	});
}

export { runTests };
