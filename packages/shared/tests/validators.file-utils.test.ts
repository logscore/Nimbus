import { formatFileSize, getFileExtension } from "../src";
import { describe, it, expect } from "@jest/globals";

describe("formatFileSize", () => {
	it("should format bytes correctly", () => {
		expect(formatFileSize(500)).toBe("500 B");
		expect(formatFileSize(1024)).toBe("1.00 KB");
		expect(formatFileSize(1536)).toBe("1.50 KB");
		expect(formatFileSize(1048576)).toBe("1.00 MB");
		expect(formatFileSize(1073741824)).toBe("1.00 GB");
	});

	it("should handle strings as input", () => {
		expect(formatFileSize("2048")).toBe("2.00 KB");
	});

	it("should return 'Invalid size' for invalid inputs", () => {
		expect(formatFileSize("abc")).toBe("Invalid size");
		expect(formatFileSize(undefined)).toBe("Invalid size");
		expect(formatFileSize(undefined)).toBe("Invalid size");
		expect(formatFileSize(-100)).toBe("Invalid size");
	});
});

describe("getFileExtension", () => {
	it("should return correct extension", () => {
		expect(getFileExtension("document.pdf")).toBe("pdf");
		expect(getFileExtension("archive.tar.gz")).toBe("gz");
		expect(getFileExtension("image.PNG")).toBe("png");
	});

	it("should return empty string if no extension", () => {
		expect(getFileExtension("filename")).toBe("");
		expect(getFileExtension("filename.")).toBe("");
		expect(getFileExtension("noextension.")).toBe("");
	});

	it("should handle hidden files properly", () => {
		expect(getFileExtension(".env")).toBe("env");
		expect(getFileExtension(".config.local")).toBe("local");
	});
});
