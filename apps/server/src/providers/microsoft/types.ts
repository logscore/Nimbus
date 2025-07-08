export interface File {
	id: string;
	name: string;
	size?: number;
	file?: {
		mimeType?: string;
	};
	folder?: any;
	parentReference?: {
		id: string;
		path: string;
	};
	createdDateTime?: string;
	lastModifiedDateTime?: string;
	webUrl?: string;
	"@microsoft.graph.downloadUrl"?: string;
}
