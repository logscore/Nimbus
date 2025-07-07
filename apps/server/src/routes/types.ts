import type { RateLimiterRedis } from "rate-limiter-flexible";

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
		rateLimiter: RateLimiterRedis;
	};
	securityHeaders?: boolean;
}
