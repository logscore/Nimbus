import type { ApiResponse, Tag, FileTag, TagOperationResponse, FileTagOperationResponse } from "@nimbus/shared";
import type { RateLimiterRedis } from "rate-limiter-flexible";

// Re-export types from shared package
export type { ApiResponse, Tag, FileTag, TagOperationResponse, FileTagOperationResponse };

/**
 * Represents an uploaded file in a request
 */
export interface UploadedFile {
	name: string;
	type: string;
	size: number;
	arrayBuffer: () => Promise<ArrayBuffer>;
}

/**
 * Security middleware options
 */
export interface SecurityOptions {
	rateLimiting?: {
		enabled: boolean;
		rateLimiter: RateLimiterRedis;
	};
	securityHeaders?: boolean;
}
