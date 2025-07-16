// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { RequestOptions } from "../../../internal/request-options";
import { buildHeaders } from "../../../internal/headers";
import { APIPromise } from "../../../core/api-promise";
import { APIResource } from "../../../core/resource";
import { path } from "../../../internal/utils/path";

export class Items extends APIResource {
	/**
	 * Create file/folder
	 */
	create(parentID: string, body: ItemCreateParams | null | undefined = {}, options?: RequestOptions): APIPromise<void> {
		return this._client.post(path`/me/drive/items/${parentID}/children`, {
			body,
			...options,
			headers: buildHeaders([{ Accept: "*/*" }, options?.headers]),
		});
	}

	/**
	 * Get item by ID
	 */
	retrieve(itemID: string, options?: RequestOptions): APIPromise<void> {
		return this._client.get(path`/me/drive/items/${itemID}`, {
			...options,
			headers: buildHeaders([{ Accept: "*/*" }, options?.headers]),
		});
	}

	/**
	 * Rename/update item
	 */
	update(itemID: string, body: ItemUpdateParams | null | undefined = {}, options?: RequestOptions): APIPromise<void> {
		return this._client.patch(path`/me/drive/items/${itemID}`, {
			body,
			...options,
			headers: buildHeaders([{ Accept: "*/*" }, options?.headers]),
		});
	}

	/**
	 * Delete an item
	 */
	delete(itemID: string, options?: RequestOptions): APIPromise<void> {
		return this._client.delete(path`/me/drive/items/${itemID}`, {
			...options,
			headers: buildHeaders([{ Accept: "*/*" }, options?.headers]),
		});
	}

	/**
	 * Download file
	 */
	downloadContent(itemID: string, options?: RequestOptions): APIPromise<void> {
		return this._client.get(path`/me/drive/items/${itemID}/content`, {
			...options,
			headers: buildHeaders([{ Accept: "*/*" }, options?.headers]),
		});
	}
}

export interface ItemCreateParams {
	file?: unknown;
	folder?: unknown;
	name?: string;
}

export interface ItemUpdateParams {
	name?: string;
}

// ✅ Renamed namespace to avoid conflict with class
export namespace ItemsTypes {
	export type CreateParams = ItemCreateParams;
	export type UpdateParams = ItemUpdateParams;
}
