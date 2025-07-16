export type ProviderName = "google" | "microsoft";

// Duplicate types piss me off. We should switch to the hc RPC client so we just have to specify the backend types in one place and the frontend will know wtf is up.
export interface File {
	id: string;
	name: string;
	mimeType: string;
	// TODO: determine if OneDrive and Google Drive need parents, oronly just one.
	parent: string;
	// TODO: (string or number): determine how Google, OneDrive, etc format their size and how to convert them. a string that represent bytes might make sense
	size: string | null;
	// TODO: (format): determine how Google, OneDrive, etc format their dates
	creationDate: string | null;
	modificationDate: string | null;
	tags?: Tag[];
	// ! these are temporary Google drive specific properties. Remove them when we have a better implementation
	webContentLink: string | null;
	webViewLink: string | null;
}

interface Tag {
	id: string;
	name: string;
	color: string;
	parentId?: string | null;
	userId: string;
	createdAt: string;
	updatedAt: string;
	_count?: number; // Number of files tagged with this tag
	children?: Tag[]; // For nested tags
}

// This will be used in the file array mapping that is returned on the files route.
// It will allow us to quickly determine if an object is a folder and adjust behavior accordingly.
//
// This may not be necessary, but it's a good practice to have a separate interface for folders. might be needed for OneDrive mostly
export interface Folder extends File {
	isFolder: boolean;
	isRoot: boolean;
	children: File[];
}

export interface DriveInfo {
	usage: string;
	limit: string;
	usageInTrash: string;

	// OneDrive
	// {
	//  	"quota": {
	//  	  "deleted": 256938,
	//  	  "fileCount": 2,
	//  	  "remaining": 1099447353539,
	//  	  "state": "normal",
	//  	  "total": 1099511627776
	//  	}
	// }

	// Google Drive
	// {
	//   "storageQuota": {
	//     "limit": string,
	//     "usageInDrive": string,
	//     "usageInDriveTrash": string,
	//     "usage": string
	//   }
	// }
}
