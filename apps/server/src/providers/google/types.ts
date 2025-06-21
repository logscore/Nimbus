export interface FileListParams {
	/**
	 * OAuth access token.
	 */
	access_token?: string;

	/**
	 * Data format for response.
	 */
	alt?: "json" | "media" | "proto";

	/**
	 * JSONP
	 */
	callback?: string;

	/**
	 * Bodies of items (files/documents) to which the query applies. Supported bodies
	 * are 'user', 'domain', 'drive', and 'allDrives'. Prefer 'user' or 'drive' to
	 * 'allDrives' for efficiency. By default, corpora is set to 'user'. However, this
	 * can change depending on the filter set through the 'q' parameter.
	 */
	corpora?: string;

	/**
	 * Deprecated: The source of files to list. Use 'corpora' instead.
	 */
	corpus?: "domain" | "user";

	/**
	 * ID of the shared drive to search.
	 */
	driveId?: string;

	/**
	 * Selector specifying which fields to include in a partial response.
	 */
	fields?: string;

	/**
	 * Whether both My Drive and shared drive items should be included in results.
	 */
	includeItemsFromAllDrives?: boolean;

	/**
	 * A comma-separated list of IDs of labels to include in the `labelInfo` part of
	 * the response.
	 */
	includeLabels?: string;

	/**
	 * Specifies which additional view's permissions to include in the response. Only
	 * 'published' is supported.
	 */
	includePermissionsForView?: string;

	/**
	 * Deprecated: Use `includeItemsFromAllDrives` instead.
	 */
	includeTeamDriveItems?: boolean;

	/**
	 * API key. Your API key identifies your project and provides you with API access,
	 * quota, and reports. Required unless you provide an OAuth 2.0 token.
	 */
	key?: string;

	/**
	 * OAuth 2.0 token for the current user.
	 */
	oauth_token?: string;

	/**
	 * A comma-separated list of sort keys. Valid keys are 'createdTime', 'folder',
	 * 'modifiedByMeTime', 'modifiedTime', 'name', 'name_natural', 'quotaBytesUsed',
	 * 'recency', 'sharedWithMeTime', 'starred', and 'viewedByMeTime'. Each key sorts
	 * ascending by default, but can be reversed with the 'desc' modifier. Example
	 * usage: ?orderBy=folder,modifiedTime desc,name.
	 */
	orderBy?: string;

	/**
	 * The maximum number of files to return per page. Partial or empty result pages
	 * are possible even before the end of the files list has been reached.
	 */
	pageSize?: number;

	/**
	 * The token for continuing a previous list request on the next page. This should
	 * be set to the value of 'nextPageToken' from the previous response.
	 */
	pageToken?: string;

	/**
	 * Returns response with indentations and line breaks.
	 */
	prettyPrint?: boolean;

	/**
	 * A query for filtering the file results. See the "Search for files & folders"
	 * guide for supported syntax.
	 */
	q?: string;

	/**
	 * Available to use for quota purposes for server-side applications. Can be any
	 * arbitrary string assigned to a user, but should not exceed 40 characters.
	 */
	quotaUser?: string;

	/**
	 * A comma-separated list of spaces to query within the corpora. Supported values
	 * are 'drive' and 'appDataFolder'.
	 */
	spaces?: string;

	/**
	 * Whether the requesting application supports both My Drives and shared drives.
	 */
	supportsAllDrives?: boolean;

	/**
	 * Deprecated: Use `supportsAllDrives` instead.
	 */
	supportsTeamDrives?: boolean;

	/**
	 * Deprecated: Use `driveId` instead.
	 */
	teamDriveId?: string;

	/**
	 * Upload protocol for media (e.g. "raw", "multipart").
	 */
	upload_protocol?: string;

	/**
	 * Legacy upload protocol for media (e.g. "media", "multipart").
	 */
	uploadType?: string;
}

/**
 * The metadata for a file. Some resource methods (such as `files.update`) require
 * a `fileId`. Use the `files.list` method to retrieve the ID for a file.
 */
export interface File {
	id?: string;

	createdTime?: string;

	description?: string;

	/**
	 * Output only. ID of the shared drive the file resides in. Only populated for
	 * items in shared drives.
	 */
	driveId?: string;

	/**
	 * Output only. Whether the file has been explicitly trashed, as opposed to
	 * recursively trashed from a parent folder.
	 */
	explicitlyTrashed?: boolean;

	/**
	 * Output only. Links for exporting Docs Editors files to specific formats.
	 */
	//   exportLinks?: Record<string, string>;

	/**
	 * Output only. The final component of `fullFileExtension`. This is only available
	 * for files with binary content in Google Drive.
	 */
	fileExtension?: string;

	/**
	 * The color for a folder or a shortcut to a folder as an RGB hex string. The
	 * supported colors are published in the `folderColorPalette` field of the About
	 * resource. If an unsupported color is specified, the closest color in the palette
	 * is used instead.
	 */
	folderColorRgb?: string;

	/**
	 * Output only. The full file extension extracted from the `name` field. May
	 * contain multiple concatenated extensions, such as "tar.gz". This is only
	 * available for files with binary content in Google Drive. This is automatically
	 * updated when the `name` field changes, however it is not cleared if the new name
	 * does not contain a valid extension.
	 */
	fullFileExtension?: string;

	/**
	 * Output only. Whether there are permissions directly on this file. This field is
	 * only populated for items in shared drives.
	 */
	hasAugmentedPermissions?: boolean;

	/**
	 * Output only. Whether this file has a thumbnail. This does not indicate whether
	 * the requesting app has access to the thumbnail. To check access, look for the
	 * presence of the thumbnailLink field.
	 */
	hasThumbnail?: boolean;

	/**
	 * Output only. The ID of the file's head revision. This is currently only
	 * available for files with binary content in Google Drive.
	 */
	headRevisionId?: string;

	/**
	 * Output only. A static, unauthenticated link to the file's icon.
	 */
	iconLink?: string;

	/**
	 * Output only. Whether the file was created or opened by the requesting app.
	 */
	isAppAuthorized?: boolean;

	/**
	 * Output only. Identifies what kind of resource this is. Value: the fixed string
	 * `"drive#file"`.
	 */
	kind?: string;

	/**
	 * Output only. The MD5 checksum for the content of the file. This is only
	 * applicable to files with binary content in Google Drive.
	 */
	md5Checksum?: string;

	/**
	 * The MIME type of the file. Google Drive attempts to automatically detect an
	 * appropriate value from uploaded content, if no value is provided. The value
	 * cannot be changed unless a new revision is uploaded. If a file is created with a
	 * Google Doc MIME type, the uploaded content is imported, if possible. The
	 * supported import formats are published in the About resource.
	 */
	mimeType?: string;

	/**
	 * Output only. Whether the file has been modified by this user.
	 */
	modifiedByMe?: boolean;

	/**
	 * The last time the file was modified by the user (RFC 3339 date-time).
	 */
	modifiedByMeTime?: string;

	/**
	 * he last time the file was modified by anyone (RFC 3339 date-time). Note that
	 * setting modifiedTime will also update modifiedByMeTime for the user.
	 */
	modifiedTime?: string;

	/**
	 * The name of the file. This is not necessarily unique within a folder. Note that
	 * for immutable items such as the top level folders of shared drives, My Drive
	 * root folder, and Application Data folder the name is constant.
	 */
	name?: string;

	/**
	 * The original filename of the uploaded content if available, or else the original
	 * value of the `name` field. This is only available for files with binary content
	 * in Google Drive.
	 */
	originalFilename?: string;

	/**
	 * Output only. Whether the user owns the file. Not populated for items in shared
	 * drives.
	 */
	ownedByMe?: boolean;

	/**
	 * The IDs of the parent folders which contain the file. If not specified as part
	 * of a create request, the file is placed directly in the user's My Drive folder.
	 * If not specified as part of a copy request, the file inherits any discoverable
	 * parents of the source file. Update requests must use the `addParents` and
	 * `removeParents` parameters to modify the parents list.
	 */
	parents?: string[];

	/**
	 * Output only. List of permission IDs for users with access to this file.
	 */
	permissionIds?: string[];

	/**
	 * A collection of arbitrary key-value pairs which are visible to all apps. Entries
	 * with null values are cleared in update and copy requests.
	 */
	properties?: Record<string, string>;

	/**
	 * Output only. The number of storage quota bytes used by the file. This includes
	 * the head revision as well as previous revisions with `keepForever` enabled.
	 */
	quotaBytesUsed?: string;

	/**
	 * Output only. A key needed to access the item via a shared link.
	 */
	resourceKey?: string;

	/**
	 * Output only. The SHA1 checksum associated with this file, if available. This
	 * field is only populated for files with content stored in Google Drive; it is not
	 * populated for Docs Editors or shortcut files.
	 */
	sha1Checksum?: string;

	/**
	 * Output only. The SHA256 checksum associated with this file, if available. This
	 * field is only populated for files with content stored in Google Drive; it is not
	 * populated for Docs Editors or shortcut files.
	 */
	sha256Checksum?: string;

	/**
	 * Output only. Whether the file has been shared. Not populated for items in shared
	 * drives.
	 */
	shared?: boolean;

	/**
	 * The time at which the file was shared with the user, if applicable (RFC 3339
	 * date-time).
	 */
	sharedWithMeTime?: string;

	/**
	 * Output only. Size in bytes of blobs and first party editor files. Won't be
	 * populated for files that have no size, like shortcuts and folders.
	 */
	size?: string;

	/**
	 * Output only. The list of spaces which contain the file. The currently supported
	 * values are 'drive', 'appDataFolder' and 'photos'.
	 */
	spaces?: string[];

	/**
	 * Whether the user has starred the file.
	 */
	starred?: boolean;

	/**
	 * Output only. A short-lived link to the file's thumbnail, if available. Typically
	 * lasts on the order of hours. Only populated when the requesting app can access
	 * the file's content. If the file isn't shared publicly, the URL returned in
	 * `Files.thumbnailLink` must be fetched using a credentialed request.
	 */
	thumbnailLink?: string;

	/**
	 * Output only. The thumbnail version for use in thumbnail cache invalidation.
	 */
	thumbnailVersion?: string;

	/**
	 * Whether the file has been trashed, either explicitly or from a trashed parent
	 * folder. Only the owner may trash a file, and other users cannot see files in the
	 * owner's trash.
	 */
	trashed?: boolean;

	/**
	 * The time that the item was trashed (RFC 3339 date-time). Only populated for
	 * items in shared drives.
	 */
	trashedTime?: string;

	/**
	 * Output only. A monotonically increasing version number for the file. This
	 * reflects every change made to the file on the server, even those not visible to
	 * the user.
	 */
	version?: string;

	/**
	 * Output only. Whether the file has been viewed by this user.
	 */
	viewedByMe?: boolean;

	/**
	 * The last time the file was viewed by the user (RFC 3339 date-time).
	 */
	viewedByMeTime?: string;

	/**
	 * @deprecated Deprecated: Use `copyRequiresWriterPermission` instead.
	 */
	viewersCanCopyContent?: boolean;

	/**
	 * Output only. A link for downloading the content of the file in a browser. This
	 * is only available for files with binary content in Google Drive.
	 */
	webContentLink?: string;

	/**
	 * Output only. A link for opening the file in a relevant Google editor or viewer
	 * in a browser.
	 */
	webViewLink?: string;

	/**
	 * Whether users with only `writer` permission can modify the file's permissions.
	 * Not populated for items in shared drives.
	 */
	writersCanShare?: boolean;
}

// Custom Route Typing
export interface FileListResponse {
	files: File[];
}

export interface FileOperationResponse {
	success: boolean;
	message?: string;
}

// Tag API Response Types
export interface Tag {
	id: string;
	name: string;
	color: string;
	parentId?: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
	_count?: number; // File count
	children?: Tag[]; // Embedded / Children tags
}

export interface FileTag {
	id: string;
	fileId: string;
	tagId: string;
	userId: string;
	createdAt: string;
}

export interface TagOperationResponse {
	success: boolean;
	message: string;
	data?: Tag | Tag[];
}

export interface FileTagOperationResponse {
	success: boolean;
	message: string;
	data?: FileTag[];
}
