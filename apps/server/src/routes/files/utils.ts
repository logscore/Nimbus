import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ApiResponse } from "@/routes/types";
import type { Context } from "hono";
import { ZodError } from "zod";

export function sendError(c: Context, error: Error | ZodError | string, status: ContentfulStatusCode = 400): Response {
	if (error instanceof ZodError) {
		return c.json<ApiResponse>({ success: false, message: error.errors[0]?.message }, status);
	}

	const message = typeof error === "string" ? error : error.message;
	return c.json<ApiResponse>({ success: false, message }, status);
}

export function sendSuccess<T>(c: Context, data?: T, message = "Success"): Response {
	if (data) {
		return c.json<ApiResponse & { data: T }>({ success: true, message, data });
	}
	return c.json<ApiResponse>({ success: true, message });
}

export function handleUploadError(error: unknown): { message: string; status: ContentfulStatusCode } {
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
