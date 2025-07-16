// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
// <reference types="node" />

import { VERSION } from "../version";

declare const window: any;

export const isRunningInBrowser = () => {
	return typeof window !== "undefined" && typeof window.document !== "undefined" && typeof navigator !== "undefined";
};

type DetectedPlatform = "deno" | "node" | "edge" | "unknown";

function getDetectedPlatform(): DetectedPlatform {
	if (typeof Deno !== "undefined" && Deno.build != null) return "deno";
	if (typeof EdgeRuntime !== "undefined") return "edge";
	if (
		Object.prototype.toString.call(
			typeof (globalThis as GlobalWithProcess).process !== "undefined" ? (globalThis as any).process : 0
		) === "[object process]"
	) {
		return "node";
	}
	return "unknown";
}

declare const Deno: any;
declare const EdgeRuntime: any;

type GlobalWithProcess = typeof globalThis & { process?: typeof process };
type Arch = "x32" | "x64" | "arm" | "arm64" | `other:${string}` | "unknown";
type PlatformName =
	| "MacOS"
	| "Linux"
	| "Windows"
	| "FreeBSD"
	| "OpenBSD"
	| "iOS"
	| "Android"
	| `Other:${string}`
	| "Unknown";

type Browser = "ie" | "edge" | "chrome" | "firefox" | "safari";

type PlatformProperties = {
	"X-Stainless-Lang": "js";
	"X-Stainless-Package-Version": string;
	"X-Stainless-OS": PlatformName;
	"X-Stainless-Arch": Arch;
	"X-Stainless-Runtime": "node" | "deno" | "edge" | `browser:${Browser}` | "unknown";
	"X-Stainless-Runtime-Version": string;
};

const getPlatformProperties = (): PlatformProperties => {
	const detectedPlatform = getDetectedPlatform();

	if (detectedPlatform === "deno") {
		return {
			"X-Stainless-Lang": "js",
			"X-Stainless-Package-Version": VERSION,
			"X-Stainless-OS": normalizePlatform(Deno.build.os),
			"X-Stainless-Arch": normalizeArch(Deno.build.arch),
			"X-Stainless-Runtime": "deno",
			"X-Stainless-Runtime-Version":
				typeof Deno.version === "string" ? Deno.version : (Deno.version?.deno ?? "unknown"),
		};
	}

	if (typeof EdgeRuntime !== "undefined") {
		return {
			"X-Stainless-Lang": "js",
			"X-Stainless-Package-Version": VERSION,
			"X-Stainless-OS": "Unknown",
			"X-Stainless-Arch": `other:${EdgeRuntime}`,
			"X-Stainless-Runtime": "edge",
			"X-Stainless-Runtime-Version": (globalThis as GlobalWithProcess).process?.version ?? "unknown",
		};
	}

	if (detectedPlatform === "node") {
		return {
			"X-Stainless-Lang": "js",
			"X-Stainless-Package-Version": VERSION,
			"X-Stainless-OS": normalizePlatform((globalThis as GlobalWithProcess).process?.platform ?? "unknown"),
			"X-Stainless-Arch": normalizeArch((globalThis as GlobalWithProcess).process?.arch ?? "unknown"),
			"X-Stainless-Runtime": "node",
			"X-Stainless-Runtime-Version": (globalThis as GlobalWithProcess).process?.version ?? "unknown",
		};
	}

	const browserInfo = getBrowserInfo();
	if (browserInfo) {
		return {
			"X-Stainless-Lang": "js",
			"X-Stainless-Package-Version": VERSION,
			"X-Stainless-OS": "Unknown",
			"X-Stainless-Arch": "unknown",
			"X-Stainless-Runtime": `browser:${browserInfo.browser}`,
			"X-Stainless-Runtime-Version": browserInfo.version,
		};
	}

	return {
		"X-Stainless-Lang": "js",
		"X-Stainless-Package-Version": VERSION,
		"X-Stainless-OS": "Unknown",
		"X-Stainless-Arch": "unknown",
		"X-Stainless-Runtime": "unknown",
		"X-Stainless-Runtime-Version": "unknown",
	};
};

type BrowserInfo = {
	browser: Browser;
	version: string;
};

declare const navigator: { userAgent: string } | undefined;

function getBrowserInfo(): BrowserInfo | null {
	if (typeof navigator === "undefined" || !navigator) return null;

	const browserPatterns = [
		{ key: "edge" as const, pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
		{ key: "ie" as const, pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
		{ key: "ie" as const, pattern: /Trident(?:.*rv:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
		{ key: "chrome" as const, pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
		{ key: "firefox" as const, pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
		{ key: "safari" as const, pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?.*Safari/ },
	];

	for (const { key, pattern } of browserPatterns) {
		const match = pattern.exec(navigator.userAgent);
		if (match) {
			const major = match[1] || "0";
			const minor = match[2] || "0";
			const patch = match[3] || "0";
			return { browser: key, version: `${major}.${minor}.${patch}` };
		}
	}

	return null;
}

const normalizeArch = (arch: string): Arch => {
	if (arch === "x32") return "x32";
	if (arch === "x86_64" || arch === "x64") return "x64";
	if (arch === "arm") return "arm";
	if (arch === "aarch64" || arch === "arm64") return "arm64";
	return arch ? `other:${arch}` : "unknown";
};

const normalizePlatform = (platform: string): PlatformName => {
	platform = platform.toLowerCase();

	if (platform.includes("ios")) return "iOS";
	if (platform === "android") return "Android";
	if (platform === "darwin") return "MacOS";
	if (platform === "win32") return "Windows";
	if (platform === "freebsd") return "FreeBSD";
	if (platform === "openbsd") return "OpenBSD";
	if (platform === "linux") return "Linux";
	return platform ? `Other:${platform}` : "Unknown";
};

let _platformHeaders: PlatformProperties;
export const getPlatformHeaders = () => {
	return (_platformHeaders ??= getPlatformProperties());
};
