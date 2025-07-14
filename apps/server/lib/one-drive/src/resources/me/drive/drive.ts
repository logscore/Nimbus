// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { ItemCreateParams, ItemUpdateParams } from "./items";
import { APIResource } from "../../../core/resource";
import * as ItemsAPI from "./items";
import * as RootAPI from "./root";
import { Items } from "./items";
import { Root } from "./root";

export class Drive extends APIResource {
	root: RootAPI.Root = new RootAPI.Root(this._client);
	items: ItemsAPI.Items = new ItemsAPI.Items(this._client);

	static Root: typeof Root;
	static Items: typeof Items;
}

Drive.Root = Root;
Drive.Items = Items;

// ✅ FIXED: renamed namespace to avoid conflict
export declare namespace DriveTypes {
	export { Items as DriveItems, ItemCreateParams, ItemUpdateParams };
}
