// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { NullableHeaders } from "./headers";

import type { HTTPMethod, MergedRequestInit } from "./types";
import type { BodyInit } from "./builtin-types";
import { type HeadersLike } from "./headers";

export type FinalRequestOptions = RequestOptions & { method: HTTPMethod; path: string };

export type RequestOptions = {
	method?: HTTPMethod;
	path?: string;
	query?: object | undefined | null;
	body?: unknown;
	headers?: HeadersLike;
	maxRetries?: number;
	stream?: boolean | undefined;
	timeout?: number;
	fetchOptions?: MergedRequestInit;
	signal?: AbortSignal | undefined | null;
	idempotencyKey?: string;
	defaultBaseURL?: string | undefined;

	__binaryResponse?: boolean | undefined;
};

export type EncodedContent = { bodyHeaders: HeadersLike; body: BodyInit };
export type RequestEncoder = (request: { _headers: NullableHeaders; body: unknown }) => EncodedContent;

export const FallbackEncoder: RequestEncoder = ({ _headers, body }) => {
	return {
		bodyHeaders: {
			"content-type": "application/json",
		},
		body: JSON.stringify(body),
	};
};
