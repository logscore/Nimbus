import { BoxIcon, DropboxIcon, GoogleIcon, MicrosoftIcon } from "@/components/icons";
import type { SocialAuthButtonProps } from "@/lib/types";
import { Button } from "@/components/ui/button";
import type { PropsWithChildren } from "react";

const providerConfig = {
	google: {
		icon: GoogleIcon,
		name: "Google",
	},
	microsoft: {
		icon: MicrosoftIcon,
		name: "Microsoft",
	},
	box: {
		icon: BoxIcon,
		name: "Box",
	},
	dropbox: {
		icon: DropboxIcon,
		name: "Dropbox",
	},
} as const;

export function SocialAuthButton({ provider, action, children, ...props }: PropsWithChildren<SocialAuthButtonProps>) {
	const config = providerConfig[provider];
	const IconComponent = config.icon;

	const getActionText = () => {
		return action === "signin" ? `Sign in with ${config.name}` : `Continue with ${config.name}`;
	};

	return (
		<Button
			variant="outline"
			type="button"
			className="w-full cursor-pointer justify-between truncate shadow-md transition-all duration-300 hover:shadow-sm"
			{...props}
		>
			<IconComponent />
			{children || getActionText()}
			<div className="w-[0.98em]" />
		</Button>
	);
}
