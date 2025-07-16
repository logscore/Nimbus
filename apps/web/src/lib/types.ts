// This file holds all the custom interfaces and types for the Next.js front end app.
import type { ChangeEvent, ComponentProps, ReactNode } from "react";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";

export interface _File {
	id: string;
	name: string;
	parent: string;
	mimeType: string;
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
	returnedValues: string[];
}

export interface SearchFilesParams {
	query: string;
	pageSize?: number;
	returnedValues?: string[];
	nextPageToken?: string;
}

export interface SearchResult {
	files: _File[];
	nextPageToken?: string;
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
	usage: string;
	limit: string;
	usageInTrash: string;
}
