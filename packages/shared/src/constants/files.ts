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

//TODO: This is AI generated, so it may not be 100% accurate - need to double check
export const MIME_TO_EXTENSION_MAP: Record<string, string[]> = {
	// Images
	"image/jpeg": [".jpg"],
	"image/png": [".png"],
	"image/gif": [".gif"],
	"image/webp": [".webp"],
	"image/avif": [".avif"],
	"image/bmp": [".bmp"],
	"image/svg+xml": [".svg"],
	"image/tiff": [".tiff"],
	"image/x-icon": [".ico"],

	// Videos
	"video/mp4": [".mp4"],
	"video/mpeg": [".mpeg"],
	"video/quicktime": [".mov"],
	"video/webm": [".webm"],
	"video/x-msvideo": [".avi"],
	"video/x-ms-wmv": [".wmv"],
	"video/x-flv": [".flv"],

	// Text and Documents
	"text/plain": [".txt"],
	"text/plain;charset=utf-8": [".txt"],
	"text/plain;charset=us-ascii": [".txt"],
	"text/plain;charset=iso-8859-1": [".txt"],
	"text/csv": [".csv"],
	"text/csv;charset=utf-8": [".csv"],
	"text/html": [".html"],
	"text/css": [".css"],
	"text/javascript": [".js"],
	"application/json": [".json"],
	"application/xml": [".xml"],
	"text/xml": [".xml"],
	"application/rtf": [".rtf"],
	"application/x-rtf": [".rtf"],
	"text/richtext": [".rtx"],
	"application/x-tex": [".tex"],
	"text/markdown": [".md"],
	"text/x-markdown": [".md"],

	// PDF and Office Documents
	"application/pdf": [".pdf"],
	"application/msword": [".doc"],
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
	"application/vnd.ms-excel": [".xls"],
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
	"application/vnd.ms-powerpoint": [".ppt"],
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
	"application/vnd.oasis.opendocument.text": [".odt"],
	"application/vnd.oasis.opendocument.spreadsheet": [".ods"],
	"application/vnd.oasis.opendocument.presentation": [".odp"],

	// Archives
	"application/zip": [".zip"],
	"application/x-zip-compressed": [".zip"],
	"application/x-7z-compressed": [".7z"],
	"application/x-rar-compressed": [".rar"],
	"application/x-tar": [".tar"],
	"application/gzip": [".gz"],
	"application/x-gzip": [".gz"],
};
