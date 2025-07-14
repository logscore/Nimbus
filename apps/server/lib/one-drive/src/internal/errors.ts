// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

interface MaybeAbortError {
	name?: unknown;
	message?: unknown;
}

export function isAbortError(err: unknown): boolean {
	return (
		typeof err === "object" &&
		err !== null &&
		(("name" in err && (err as MaybeAbortError).name === "AbortError") ||
			("message" in err && String((err as MaybeAbortError).message).includes("FetchRequestCanceledException")))
	);
}

export const castToError = (err: unknown): Error => {
	if (err instanceof Error) return err;

	if (typeof err === "object" && err !== null) {
		try {
			if (Object.prototype.toString.call(err) === "[object Error]") {
				// @ts-ignore - not all envs have native support for cause yet
				const error = new Error(
					(err as { message?: string }).message ?? "",
					(err as { cause?: unknown }).cause ? { cause: (err as { cause?: unknown }).cause } : {}
				);

				if ((err as { stack?: string }).stack) error.stack = (err as { stack?: string }).stack;
				if ((err as { cause?: unknown }).cause && !("cause" in error)) {
					// @ts-ignore
					error.cause = (err as { cause?: unknown }).cause;
				}
				if ((err as { name?: string }).name) error.name = (err as { name?: string }).name!;
				return error;
			}
		} catch {
			// Ignore and fall back to generic conversion
		}

		try {
			return new Error(JSON.stringify(err));
		} catch {
			// Ignore and fall back to generic string cast
		}
	}

	return new Error(String(err));
};
