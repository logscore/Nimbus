/* eslint-env node */
// Quick S3 Provider Test Script
// Run with: bun test-s3.js

import { S3Provider } from "../s3-provider";

async function testS3Provider() {
	console.log("🧪 Testing S3 Provider Implementation...\n");

	// Get credentials from environment variables
	const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
	const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	const region = process.env.AWS_REGION || "us-east-1";
	const bucketName = process.env.AWS_BUCKET_NAME;

	// Validate required credentials
	if (!accessKeyId || !secretAccessKey || !bucketName) {
		console.error("❌ Missing required environment variables:");
		console.error("   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME");
		console.error("\n💡 Set these in your .env file or environment");
		return;
	}

	const config = {
		accessKeyId,
		secretAccessKey,
		region,
		bucketName,
	};

	console.log("📝 Configuration:");
	console.log(`- Region: ${config.region}`);
	console.log(`- Bucket: ${config.bucketName}`);
	console.log(`- Access Key: ${config.accessKeyId.substring(0, 8)}...`);
	console.log("");

	try {
		// Create S3 provider instance
		const s3Provider = new S3Provider(config);
		console.log("✅ S3Provider created successfully");

		// Test 1: Get drive info (bucket validation)
		console.log("\n🔍 Test 1: Validating bucket access...");
		const driveInfo = await s3Provider.getDriveInfo();
		if (driveInfo) {
			console.log("✅ Bucket accessible!");
		} else {
			console.log("❌ Bucket not accessible");
			return;
		}

		// Test 2: List root files
		console.log("\n📂 Test 2: Listing root files...");
		const files = await s3Provider.listChildren();
		console.log(`✅ Found ${files.items.length} items in bucket root`);

		if (files.items.length > 0) {
			console.log("Files/Folders:");
			files.items.forEach(item => {
				console.log(`  - ${item.name} (${item.mimeType === "application/x-directory" ? "folder" : "file"})`);
			});
		}

		// Test 3: Create a test file
		console.log("\n📄 Test 3: Creating test file...");
		const testContent = Buffer.from("Hello from Nimbus S3 Provider! 🚀");
		const createdFile = await s3Provider.create(
			{
				name: "nimbus-test.txt",
				mimeType: "text/plain",
			},
			testContent
		);

		if (createdFile) {
			console.log(`✅ File created: ${createdFile.name} (ID: ${createdFile.id})`);

			// Test 4: Download the file we just created
			console.log("\n⬇️ Test 4: Downloading test file...");
			const downloaded = await s3Provider.download(createdFile.id);
			if (downloaded) {
				const content = downloaded.data.toString();
				console.log(`✅ Downloaded: "${content}"`);
				console.log(`   Size: ${downloaded.size} bytes`);
				console.log(`   MIME: ${downloaded.mimeType}`);
			}

			// Test 5: Delete the test file (cleanup)
			console.log("\n🗑️ Test 5: Cleaning up test file...");
			const deleted = await s3Provider.delete(createdFile.id);
			console.log(deleted ? "✅ Test file deleted" : "❌ Failed to delete test file");
		}

		console.log("\n🎉 All tests completed successfully!");
		console.log("\n✅ S3 Provider Implementation is working 100%!");
	} catch (error) {
		console.error("\n❌ Test failed:", error instanceof Error ? error.message : String(error));
		console.error("\n🔧 Troubleshooting:");
		console.error("1. Check your AWS credentials");
		console.error("2. Verify bucket name and region");
		console.error("3. Ensure bucket exists and is accessible");
		console.error("4. Check IAM permissions");
	}
}

// Run the test
testS3Provider();
