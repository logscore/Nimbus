import type { RateLimiterRedis as ValkeyRateLimit } from "rate-limiter-flexible";
import type { Ratelimit as UpstashRateLimit } from "@upstash/ratelimit";
import type { Context } from "hono";

export interface ApiResponse {
	success: boolean;
	message?: string;
}

// Tag API Response Types
export interface Tag {
	id: string;
	name: string;
	color: string;
	parentId?: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
	_count?: number; // File count
	children?: Tag[]; // Embedded / Children tags
}

export interface FileTag {
	id: string;
	fileId: string;
	tagId: string;
	userId: string;
	createdAt: string;
}

export interface UploadedFile {
	name: string;
	type: string;
	size: number;
	arrayBuffer: () => Promise<ArrayBuffer>;
}

export interface TagOperationResponse {
	success: boolean;
	message: string;
	data?: Tag | Tag[];
}

export interface FileTagOperationResponse {
	success: boolean;
	message: string;
	data?: FileTag[];
}

// Security/Rate Limiting

export interface SecurityOptions {
	rateLimiting?: {
		enabled: boolean;
		rateLimiter: (c: Context) => ValkeyRateLimit | UpstashRateLimit;
	};
	securityHeaders?: boolean;
}
