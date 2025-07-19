/**
 * Represents an uploaded file in a request
 */
export interface UploadedFile {
	name: string;
	type: string;
	size: number;
	arrayBuffer: () => Promise<ArrayBuffer>;
}
