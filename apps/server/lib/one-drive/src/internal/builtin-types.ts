// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

export type Fetch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type _RequestInit = RequestInit;
type _Response = Response;
type _RequestInfo = Request | URL | string;
type _HeadersInit = RequestInit["headers"];
type _BodyInit = RequestInit["body"];

type _Array<T> = Array<T>;

type _Record<K extends keyof any, T> = Record<K, T>;

export type {
	_Array as Array,
	_BodyInit as BodyInit,
	_HeadersInit as HeadersInit,
	_Record as Record,
	_RequestInfo as RequestInfo,
	_RequestInit as RequestInit,
	_Response as Response,
};

type EndingType = "native" | "transparent";

export interface BlobPropertyBag {
	endings?: EndingType;
	type?: string;
}

export interface FilePropertyBag extends BlobPropertyBag {
	lastModified?: number;
}
