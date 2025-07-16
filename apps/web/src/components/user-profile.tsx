import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const iconvVariants = cva("rounded-full border flex items-center justify-center", {
	variants: {
		size: {
			default: "!size-8 min-w-8 rounded-full",
			sm: "!size-10 min-w-10 rounded-full",
			lg: "!size-12 min-w-12 rounded-full",
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
	const initials = getInitials(name);

	const [isClient, setIsClient] = React.useState(false);
	React.useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<Avatar className={cn(iconvVariants({ size }), className)}>
			<AvatarImage src={url as string} />
			<AvatarFallback className="rounded-md bg-gray-100 text-sm font-semibold text-gray-500">
				{isClient ? initials : ""}
			</AvatarFallback>
		</Avatar>
	);
};

export default Profile;
