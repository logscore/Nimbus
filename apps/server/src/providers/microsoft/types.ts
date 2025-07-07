export interface File {
	id: string;
	name: string;
	size?: number;
	file?: any;
	folder?: any;
	parentReference?: {
		id: string;
		path: string;
	};
	createdDateTime?: string;
	lastModifiedDateTime?: string;
}
