// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { OneDrive } from "../client";

export abstract class APIResource {
	protected _client: OneDrive;

	constructor(client: OneDrive) {
		this._client = client;
	}
}
