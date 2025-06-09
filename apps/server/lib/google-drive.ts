import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { drive_v3 } from "googleapis/build/src/apis/drive/v3";
import { env } from "src/config/env";

export interface DriveManagerConfig {
	auth?: {
		refreshToken: string;
		email?: string;
	};
}

export interface DriveFile {
	id: string;
	name: string;
	mimeType: string;
	modifiedTime?: string;
	size?: string;
	webViewLink?: string;
	iconLink?: string;
	parents?: string[];
	$raw?: any;
}

export class GoogleDriveManager {
	private auth: OAuth2Client;
	private drive: drive_v3.Drive;

	constructor(public config: DriveManagerConfig) {
		this.auth = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);

		// Should have to just call getAccessToken from betterauth and pass token to setCredentials
		if (config.auth) {
			this.auth.setCredentials({});
		}

		this.drive = google.drive({ version: "v3", auth: this.auth });
	}

	//Get the OAuth2 scope for Google Drive
	public getScope(): string {
		return [
			"https://www.googleapis.com/auth/drive",
			"https://www.googleapis.com/auth/userinfo.profile",
			"https://www.googleapis.com/auth/userinfo.email",
		].join(" ");
	}

	//Get access tokens from authorization code
	public async getTokens(code: string) {
		return this.withErrorHandler(
			"getTokens",
			async () => {
				const { tokens } = await this.auth.getToken(code);
				return { tokens };
			},
			{ code }
		);
	}

	//List files in Google Drive
	public async listFiles(params: {
		folderId?: string;
		query?: string;
		pageSize?: number;
		pageToken?: string;
		fields?: string;
	}) {
		const { folderId, query, pageSize = 100, pageToken, fields } = params;

		return this.withErrorHandler(
			"listFiles",
			async () => {
				let q = "";

				// If folderId is provided, list files in that folder
				if (folderId) {
					q = `'${folderId}' in parents`;
				}

				// If additional query is provided, append it
				if (query) {
					q = q ? `${q} and ${query}` : query;
				}

				const res = await this.drive.files.list({
					q,
					pageSize,
					pageToken: pageToken || undefined,
					fields:
						fields || "nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink, iconLink, parents)",
				});

				return {
					files: (res.data.files || []).map(file => ({
						id: file.id || "",
						name: file.name || "",
						mimeType: file.mimeType || "",
						modifiedTime: file.modifiedTime,
						size: file.size,
						webViewLink: file.webViewLink,
						iconLink: file.iconLink,
						parents: file.parents,
						$raw: file,
					})),
					nextPageToken: res.data.nextPageToken || null,
				};
			},
			{ folderId, query, pageSize, pageToken }
		);
	}

	//Get a file from Google Drive by ID
	public async getFile(fileId: string, fields?: string) {
		return this.withErrorHandler(
			"getFile",
			async () => {
				const res = await this.drive.files.get({
					fileId,
					fields: fields || "id, name, mimeType, modifiedTime, size, webViewLink, iconLink, parents",
				});

				const file = res.data;
				return {
					id: file.id || "",
					name: file.name || "",
					mimeType: file.mimeType || "",
					modifiedTime: file.modifiedTime,
					size: file.size,
					webViewLink: file.webViewLink,
					iconLink: file.iconLink,
					parents: file.parents,
					$raw: file,
				};
			},
			{ fileId }
		);
	}

	//Download a file from Google Drive
	public async downloadFile(fileId: string) {
		return this.withErrorHandler(
			"downloadFile",
			async () => {
				const res = await this.drive.files.get(
					{
						fileId,
						alt: "media",
					},
					{ responseType: "arraybuffer" }
				);

				return {
					data: res.data,
					contentType: res.headers["content-type"],
				};
			},
			{ fileId }
		);
	}

	//Get user info from Google API
	public async getUserInfo() {
		return this.withErrorHandler(
			"getUserInfo",
			async () => {
				const res = await google.people({ version: "v1", auth: this.auth }).people.get({
					resourceName: "people/me",
					personFields: "names,photos,emailAddresses",
				});

				return {
					email: res.data.emailAddresses?.[0]?.value || "",
					name: res.data.names?.[0]?.displayName || "",
					photo: res.data.photos?.[0]?.url || "",
				};
			},
			{}
		);
	}

	//Error handler wrapper for async functions
	private async withErrorHandler<T>(
		operation: string,
		fn: () => Promise<T>,
		context?: Record<string, unknown>
	): Promise<T> {
		try {
			return await fn();
		} catch (error: any) {
			console.error(`Error in GoogleDriveManager.${operation}:`, error.message, context);
			throw error;
		}
	}
}
