// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from "../../core/resource";
import * as DriveAPI from "./drive/drive";

export class Me extends APIResource {
	drive: DriveAPI.Drive = new DriveAPI.Drive(this._client);
}

// ✅ Optionally: re-export types or classes
export namespace MeNamespace {
	export type Drive = DriveAPI.Drive;
}
