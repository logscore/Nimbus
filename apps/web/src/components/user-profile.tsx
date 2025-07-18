"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { useIsMounted } from "@/hooks/useIsMounted";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const iconvVariants = cva("rounded-full border flex items-center justify-center", {
	variants: {
		size: {
			default: "!size-8 min-w-8 rounded-full",
			sm: "!size-10 min-w-10 rounded-full",
			lg: "!size-12 min-w-12 rounded-full",
			xl: "!size-14 min-w-14 rounded-full",
			xxl: "!size-16 min-w-16 rounded-full",
			xxxl: "!size-18 min-w-18 rounded-full",
			xxxxl: "!size-20 min-w-20 rounded-full",
			xxxxxl: "!size-22 min-w-22 rounded-full",
			xxxxxxl: "!size-24 min-w-24 rounded-full",
		},
	},
	defaultVariants: {
		size: "default",
	},
});

interface ProfileProps extends VariantProps<typeof iconvVariants> {
	className?: string;
	url: string | null;
	name: string;
}

const getInitials = (name?: string | null) => {
	if (!name) return "...";
	const parts = name.trim().split(/\s+/);
	if (parts.length === 0) return "...";

	const firstInitial = parts[0]?.[0] || "";
	const lastInitial = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";

	return (firstInitial + lastInitial).toUpperCase() || "...";
};

const Profile = ({ className, url, name, size }: ProfileProps) => {
	const isMounted = useIsMounted();
	const initials = useMemo(() => getInitials(name), [name]);

	// Don't render anything on the server to avoid hydration mismatch
	if (!isMounted) {
		return <div className={cn(iconvVariants({ size }), "animate-pulse bg-gray-200 dark:bg-gray-700", className)} />;
	}

	return (
		<Avatar className={cn(iconvVariants({ size }), className)}>
			{url && <AvatarImage src={url} alt={name} />}
			<AvatarFallback className="rounded-md bg-gray-100 font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
				{isMounted ? initials : "..."}
			</AvatarFallback>
		</Avatar>
	);
};

export default Profile;
