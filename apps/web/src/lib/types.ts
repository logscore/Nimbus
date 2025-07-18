// This file holds web-specific types and interfaces for the Next.js front end app.
import type { ChangeEvent, ComponentProps, ReactNode } from "react";
import type { Button } from "@/components/ui/button";
import type { DriveProvider } from "@nimbus/shared";
import type { Input } from "@/components/ui/input";

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

export interface AuthCardProps extends ComponentProps<"div"> {
	title: string;
	description: string;
	navigationType: "signin" | "signup";
	children: ReactNode;
}

type AuthAction = "signin" | "signup";

export interface SocialAuthButtonProps extends Omit<ComponentProps<typeof Button>, "variant" | "type"> {
	provider: DriveProvider;
	action: AuthAction;
	children?: ReactNode;
}

export interface PasswordInputProps extends Omit<ComponentProps<typeof Input>, "type"> {
	value?: string;
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}
