import { DEFAULT_MIME_TYPE } from "@nimbus/shared";

const MIME_TYPE_MAPPINGS: Record<string, string> = {
	txt: "text/plain",
	pdf: "application/pdf",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	gif: "image/gif",
	mp4: "video/mp4",
	mp3: "audio/mpeg",
	zip: "application/zip",
	doc: "application/msword",
	docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	xls: "application/vnd.ms-excel",
	xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	ppt: "application/vnd.ms-powerpoint",
	pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
	js: "application/javascript",
	json: "application/json",
	html: "text/html",
	css: "text/css",
	webm: "video/webm",
	avi: "video/x-msvideo",
	wav: "audio/wav",
	tar: "application/x-tar",
	gz: "application/gzip",
	rar: "application/vnd.rar",
};

export function getMimeTypeFromExtension(filename: string): string {
	const extension = filename.split(".").pop()?.toLowerCase();
	return MIME_TYPE_MAPPINGS[extension || ""] || DEFAULT_MIME_TYPE;
}
