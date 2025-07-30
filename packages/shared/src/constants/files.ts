// Default values for file operations
export const DEFAULT_MIME_TYPE = "application/octet-stream";
export const DEFAULT_PAGE_SIZE = 100;
export const DEFAULT_ORDER_BY = "folder,modifiedTime desc";
export const DEFAULT_SPACE = 0;

// Maximum file size: 100MB
export const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Allowed MIME types for file uploads
export const ALLOWED_MIME_TYPES = [
	// Images
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/avif",
	"image/bmp",
	"image/svg+xml",
	"image/tiff",
	"image/x-icon",

	// Videos
	"video/mp4",
	"video/mpeg",
	"video/quicktime",
	"video/webm",
	"video/x-msvideo",
	"video/x-ms-wmv",

	// Text and Documents
	"text/plain",
	"text/plain;charset=utf-8",
	"text/plain;charset=us-ascii",
	"text/plain;charset=iso-8859-1",
	"text/csv",
	"text/csv;charset=utf-8",
	"text/html",
	"text/css",
	"text/javascript",
	"application/json",
	"application/xml",
	"text/xml",
	"application/rtf",
	"application/x-rtf",
	"text/richtext",
	"application/x-tex",
	"text/markdown",
	"text/x-markdown",

	// PDF and Office Documents
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.ms-powerpoint",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	"application/vnd.oasis.opendocument.text",
	"application/vnd.oasis.opendocument.spreadsheet",
	"application/vnd.oasis.opendocument.presentation",

	// Archives
	"application/zip",
	"application/x-zip-compressed",
	"application/x-7z-compressed",
	"application/x-rar-compressed",
	"application/x-tar",
	"application/gzip",
	"application/x-gzip",
];
