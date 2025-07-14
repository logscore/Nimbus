// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { RequestOptions } from "../../../internal/request-options";
import { buildHeaders } from "../../../internal/headers";
import { APIPromise } from "../../../core/api-promise";
import { APIResource } from "../../../core/resource";

export class Root extends APIResource {
	/**
	 * List root folder
	 */
	listChildren(options?: RequestOptions): APIPromise<void> {
		return this._client.get("/me/drive/root/children", {
			...options,
			headers: buildHeaders([{ Accept: "*/*" }, options?.headers]),
		});
	}
}
