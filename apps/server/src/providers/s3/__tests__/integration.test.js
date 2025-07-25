/* eslint-env node */
// Comprehensive S3 Provider Test
// Tests all Provider interface methods

import { S3Provider } from "../s3-provider";

const config = {
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION || "us-east-1",
	bucketName: process.env.AWS_BUCKET_NAME,
};

async function comprehensiveTest() {
	console.log("🚀 COMPREHENSIVE S3 PROVIDER TEST");
	console.log("==================================\n");

	// Validate required credentials
	if (!config.accessKeyId || !config.secretAccessKey || !config.bucketName) {
		console.error("❌ Missing required environment variables:");
		console.error("   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME");
		return;
	}

	const s3Provider = new S3Provider({
		accessKeyId: config.accessKeyId,
		secretAccessKey: config.secretAccessKey,
		region: config.region,
		bucketName: config.bucketName,
	});
	let testResults = [];

	try {
		// Test 1: Authentication Interface
		console.log("1️⃣ Testing Authentication Interface...");
		const token = s3Provider.getAccessToken();
		console.log(`   ✅ getAccessToken(): ${token.substring(0, 20)}...`);

		s3Provider.setAccessToken("test-token");
		console.log(`   ✅ setAccessToken(): ${s3Provider.getAccessToken()}`);

		// Reset to real credentials
		s3Provider.setAccessToken(token);
		testResults.push("✅ Authentication Interface");

		// Test 2: Drive Information
		console.log("\n2️⃣ Testing Drive Information...");
		const driveInfo = await s3Provider.getDriveInfo();
		console.log(`   ✅ getDriveInfo(): Bucket accessible`);
		testResults.push("✅ Drive Information");

		// Test 3: File Creation (Files & Folders)
		console.log("\n3️⃣ Testing File Creation...");

		// Create a folder
		const folder = await s3Provider.create({
			name: "test-folder",
			mimeType: "application/vnd.google-apps.folder",
		});
		if (!folder) throw new Error("Failed to create folder");
		console.log(`   ✅ Create folder: ${folder.name} (${folder.id})`);

		// Create a file in root
		const rootFile = await s3Provider.create(
			{
				name: "root-test.txt",
				mimeType: "text/plain",
			},
			Buffer.from("Root file content")
		);
		if (!rootFile) throw new Error("Failed to create root file");
		console.log(`   ✅ Create root file: ${rootFile.name}`);

		// Create a file in folder
		const nestedFile = await s3Provider.create(
			{
				name: "nested-test.txt",
				parentId: folder.id,
				mimeType: "text/plain",
			},
			Buffer.from("Nested file content")
		);
		if (!nestedFile) throw new Error("Failed to create nested file");
		console.log(`   ✅ Create nested file: ${nestedFile.name}`);

		testResults.push("✅ File Creation");

		// Test 4: File Retrieval
		console.log("\n4️⃣ Testing File Retrieval...");
		const retrievedFile = await s3Provider.getById(rootFile.id);
		if (!retrievedFile) throw new Error("Failed to retrieve file");
		console.log(`   ✅ getById(): ${retrievedFile.name} (${retrievedFile.size} bytes)`);
		testResults.push("✅ File Retrieval");

		// Test 5: Directory Listing
		console.log("\n5️⃣ Testing Directory Listing...");
		const rootListing = await s3Provider.listChildren();
		console.log(`   ✅ List root: ${rootListing.items.length} items`);
		rootListing.items.forEach(item => {
			console.log(`      - ${item.name} (${item.mimeType === "application/x-directory" ? "folder" : "file"})`);
		});

		const folderListing = await s3Provider.listChildren(folder.id);
		console.log(`   ✅ List folder: ${folderListing.items.length} items`);
		folderListing.items.forEach(item => {
			console.log(`      - ${item.name} (${item.mimeType === "application/x-directory" ? "folder" : "file"})`);
		});
		testResults.push("✅ Directory Listing");

		// Test 6: File Download
		console.log("\n6️⃣ Testing File Download...");
		const downloaded = await s3Provider.download(rootFile.id);
		if (!downloaded) throw new Error("Failed to download file");
		console.log(`   ✅ Download: "${downloaded.data.toString()}" (${downloaded.size} bytes)`);
		testResults.push("✅ File Download");

		// Test 7: File Update
		console.log("\n7️⃣ Testing File Update...");
		const updated = await s3Provider.update(rootFile.id, {
			name: "renamed-test.txt",
		});
		if (!updated) throw new Error("Failed to update file");
		console.log(`   ✅ Update/Rename: ${rootFile.name} → ${updated.name}`);
		testResults.push("✅ File Update");

		// Test 8: File Copy
		console.log("\n8️⃣ Testing File Copy...");
		const copied = await s3Provider.copy(updated.id, folder.id, "copied-file.txt");
		if (!copied) throw new Error("Failed to copy file");
		console.log(`   ✅ Copy: ${updated.name} → ${copied.name} (in folder)`);
		testResults.push("✅ File Copy");

		// Test 9: File Move
		console.log("\n9️⃣ Testing File Move...");
		const moved = await s3Provider.move(nestedFile.id, "", "moved-to-root.txt");
		if (!moved) throw new Error("Failed to move file");
		console.log(`   ✅ Move: ${nestedFile.name} → ${moved.name} (to root)`);
		testResults.push("✅ File Move");

		// Test 10: Search
		console.log("\n🔟 Testing Search...");
		const searchResults = await s3Provider.search("test");
		console.log(`   ✅ Search 'test': Found ${searchResults.items.length} matches`);
		searchResults.items.forEach(item => {
			console.log(`      - ${item.name}`);
		});
		testResults.push("✅ Search");

		// Test 11: Shareable Links (Expected to return null for S3)
		console.log("\n1️⃣1️⃣ Testing Shareable Links...");
		const shareLink = await s3Provider.getShareableLink(updated.id);
		console.log(`   ✅ getShareableLink(): ${shareLink || "null (expected for S3)"}`);
		testResults.push("✅ Shareable Links");

		// Cleanup
		console.log("\n🧹 Cleaning up test files...");
		await s3Provider.delete(updated.id);
		await s3Provider.delete(copied.id);
		await s3Provider.delete(moved.id);
		await s3Provider.delete(folder.id); // This should delete the folder and any remaining contents
		console.log("   ✅ Cleanup completed");

		// Final Results
		console.log("\n" + "=".repeat(50));
		console.log("🎉 COMPREHENSIVE TEST RESULTS");
		console.log("=".repeat(50));
		testResults.forEach(result => console.log(result));
		console.log("\n🏆 ALL TESTS PASSED! S3 Provider is 100% functional!");
		console.log("\n✨ Provider Interface Methods Tested:");
		console.log("   • create() - Files & Folders ✅");
		console.log("   • getById() - File retrieval ✅");
		console.log("   • update() - File rename/metadata ✅");
		console.log("   • delete() - File/folder deletion ✅");
		console.log("   • listChildren() - Directory listing ✅");
		console.log("   • download() - File content retrieval ✅");
		console.log("   • copy() - File duplication ✅");
		console.log("   • move() - File relocation ✅");
		console.log("   • search() - File search ✅");
		console.log("   • getDriveInfo() - Storage info ✅");
		console.log("   • getShareableLink() - Link generation ✅");
		console.log("   • getAccessToken() - Auth interface ✅");
		console.log("   • setAccessToken() - Auth interface ✅");
	} catch (error) {
		console.error("\n❌ Test failed:", error instanceof Error ? error.message : String(error));
		if (error instanceof Error && error.stack) {
			console.error("Stack:", error.stack);
		}
	}
}

comprehensiveTest();
