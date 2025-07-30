import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ApiResponse } from "@nimbus/shared";
import type { Context } from "hono";

interface ErrorResponseOptions {
	message?: string;
	status?: ContentfulStatusCode;
}

interface SuccessResponseOptions<T> {
	data?: T;
	message?: string;
	status?: ContentfulStatusCode;
}

export function sendForbidden(c: Context, message?: string) {
	return sendError(c, { message: message || "Forbidden", status: 403 });
}

export function sendUnauthorized(c: Context, message?: string) {
	return sendError(c, { message: message || "Unauthorized", status: 401 });
}

export function sendError(c: Context, options?: ErrorResponseOptions) {
	const success = false;
	const { message = "Internal server error", status = 500 } = options ?? {};
	console.error(options);
	return c.json<ApiResponse>({ success, message }, status);
}

export function sendSuccess<T extends Record<string, any> | any[]>(c: Context, options?: SuccessResponseOptions<T>) {
	const success = true;
	const { data, message = "Success", status = 200 } = options ?? {};

	if (data) {
		return c.json<T>(data, status);
	} else {
		return c.json<ApiResponse>({ success, message }, status);
	}
}

export function handleUploadError(error: unknown): ErrorResponseOptions {
	console.error("Request processing error:", error);

	if (error instanceof Error) {
		if (error.message.includes("maxFileSize")) {
			return { message: "File too large", status: 413 };
		}
		if (error.message.includes("timed out")) {
			return { message: "Upload timed out", status: 408 };
		}
		return { message: "Invalid request", status: 400 };
	}

	return { message: "An error occurred", status: 500 };
}
