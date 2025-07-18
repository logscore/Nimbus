"use client";

import { Fallback, Image, Root } from "@radix-ui/react-avatar";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Avatar({ className, ...props }: ComponentProps<typeof Root>) {
	return (
		<Root
			data-slot="avatar"
			className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}
			{...props}
		/>
	);
}

function AvatarImage({ className, alt = "Avatar", ...props }: ComponentProps<typeof Image>) {
	return <Image data-slot="avatar-image" className={cn("aspect-square size-full", className)} alt={alt} {...props} />;
}

function AvatarFallback({ className, ...props }: ComponentProps<typeof Fallback>) {
	return (
		<Fallback
			data-slot="avatar-fallback"
			className={cn("bg-muted flex size-full items-center justify-center rounded-full", className)}
			delayMs={0} // <-- This line fixes the hydration error
			{...props}
		/>
	);
}

export { Avatar, AvatarFallback, AvatarImage };
