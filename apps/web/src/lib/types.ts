// This file holds all the custom interfaces and types for the Next.js front end app.
import type { ChangeEvent, ComponentProps, ComponentType, ReactNode } from "react";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";

export interface Tag {
	id: string;
	name: string;
	color: string;
	parentId?: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
	_count?: number; // Number of files tagged with this tag
	children?: Tag[]; // For nested tags
}

export interface FileTag {
	id: string;
	fileId: string;
	tagId: string;
	userId: string;
	createdAt: string;
}

export interface FileItem {
	id: string;
	name: string;
	type: "folder" | "document" | "image" | "video";
	size?: string;
	modified: string;
	tags?: Tag[]; // Tags associated with this file
}

export interface CreateFolderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreateFolder: (folderName: string, parentId?: string | undefined) => void;
}

export interface UploadFileDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUpload: (files: FileList) => void;
}

export interface FolderContentItem extends FileItem {
	path?: string;
}

export interface Source {
	name: string;
	icon: ComponentType<{ className?: string }>;
	value: string;
	backgroundColor: string;
	textColor?: string;
}

export interface AuthState {
	isLoading: boolean;
	error: string | null;
}

export interface DeleteFileParams {
	id: string;
}

export interface AuthCardProps extends ComponentProps<"div"> {
	title: string;
	description: string;
	navigationType: "signin" | "signup";
	children: ReactNode;
}

export type Params = Record<string, string | number | null | undefined>;

export interface CreateRequestOptions {
	path: string;
	pathParams?: Params;
	queryParams?: Params;
}

export interface UseRequestParams {
	request: (signal: AbortSignal) => Promise<Response>;
	triggers?: unknown[];
	manual?: boolean;
}

export interface UseRequestReturn<ResponseBody> {
	data: ResponseBody | null;
	error: Error | null;
	isLoading: boolean;
	refetch: () => Promise<void>;
}

export interface CreateFolderParams {
	name: string;
	parentId?: string;
}

export type SocialProvider = "google";
export type AuthAction = "signin" | "signup";

export interface SocialAuthButtonProps extends Omit<ComponentProps<typeof Button>, "children" | "variant" | "type"> {
	provider: SocialProvider;
	action: AuthAction;
}

export interface PasswordInputProps extends Omit<ComponentProps<typeof Input>, "type"> {
	value?: string;
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}
