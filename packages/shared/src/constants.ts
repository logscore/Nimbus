// Default values for file operations
export const DEFAULT_MIME_TYPE = "application/octet-stream";
export const DEFAULT_PAGE_SIZE = 100;
export const DEFAULT_ORDER_BY = "name";
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

	// Documents
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.ms-powerpoint",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
