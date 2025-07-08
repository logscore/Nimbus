// This file holds all the custom interfaces and types for the Next.js front end app.
import type { ChangeEvent, ComponentProps, ReactNode } from "react";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";

// use "_File" because "File" is the Node File type, which is used for uploading a file

import type { File as _File, DriveInfo, FileMetadata, FileType, Tag } from "@nimbus/shared";

export type { DriveInfo, _File as File, FileMetadata, FileType, Tag };

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
