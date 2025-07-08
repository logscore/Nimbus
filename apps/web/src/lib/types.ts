// This file holds all the custom interfaces and types for the Next.js front end app.
import type { ChangeEvent, ComponentProps, ReactNode } from "react";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";

export type FileType = "file" | "folder" | "shortcut" | "other";

export interface FileMetadata {
	/** The name of the file including the file extension */
	name: string;

	/** The MIME type of the file */
	mimeType: string;

	/** ID of the parent folder */
	parentId?: string;

	/** Description of the file */
	description?: string;

	/** Size of the file in bytes */
	size?: number;

	/** Web URL to view the file */
	webViewLink?: string;

	/** Direct download URL for the file content */
	webContentLink?: string;

	/** ISO 8601 date string when the file was created */
	createdTime?: string;

	/** ISO 8601 date string when the file was last modified */
	modifiedTime?: string;

	/** Custom metadata specific to the provider */
	providerMetadata?: Record<string, unknown>;
}

interface _File extends FileMetadata {
	/** Unique identifier for the file */
	id: string;

	/** Type of the file */
	type: FileType;

	/** ID of the parent folder */
	parentId: string;

	/** Size of the file in bytes */
	size: number;

	/** ISO 8601 date string when the file was created */
	createdTime: string;

	/** ISO 8601 date string when the file was last modified */
	modifiedTime: string;

	/** Tags associated with the file */
	tags?: Tag[];

	/** Whether the file has been trashed */
	trashed?: boolean;
}

export type { _File as File };

export interface Tag {
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

// Dialog prop types

export interface CreateFolderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	parentId: string;
}

export interface UploadFileDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	parentId: string;
}

// File operation hook types

export interface DeleteFileParams {
	fileId: string;
}

export interface CreateFolderParams {
	name: string;
	parentId?: string;
}

export interface UpdateFileParams {
	fileId: string;
	name?: string;
	// Add other update properties like descriptions later
}

export interface UploadFileParams {
	file: File; // Node file type
	parentId: string;
	onProgress?: (progress: number) => void;
}

// Auth types

export interface AuthState {
	isLoading: boolean;
	error: string | null;
}

export interface AuthCardProps extends ComponentProps<"div"> {
	title: string;
	description: string;
	navigationType: "signin" | "signup";
	children: ReactNode;
}

type SocialProvider = "google" | "microsoft";
type AuthAction = "signin" | "signup";

export interface SocialAuthButtonProps extends Omit<ComponentProps<typeof Button>, "children" | "variant" | "type"> {
	provider: SocialProvider;
	action: AuthAction;
}

export interface PasswordInputProps extends Omit<ComponentProps<typeof Input>, "type"> {
	value?: string;
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

// Drive route types

export interface DriveInfo {
	/** Total storage space in bytes */
	totalSpace: number;

	/** Used storage space in bytes */
	usedSpace: number;

	/** Storage space in trash in bytes */
	trashSize: number;

	/** Number of items in trash */
	trashItems: number;

	/** Total number of files */
	fileCount: number;

	/** Storage quota state (e.g., 'normal', 'nearLimit', etc.) */
	state?: string;

	/** Provider-specific metadata */
	providerMetadata?: Record<string, unknown>;
}
