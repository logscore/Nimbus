"use client";

import type { SocialAuthButtonProps } from "@/lib/types";
import { Google, Microsoft } from "@/components/icons";
import { Button } from "@/components/ui/button";

const providerConfig = {
	google: {
		icon: Google,
		name: "Google",
	},
	microsoft: {
		icon: Microsoft,
		name: "Microsoft",
	},
} as const;

export function SocialAuthButton({
	provider,
	action,
	children,
	...props
}: React.PropsWithChildren<SocialAuthButtonProps>) {
	const config = providerConfig[provider];
	const IconComponent = config.icon;

	const getActionText = () => {
		return action === "signin" ? `Sign in with ${config.name}` : `Continue with ${config.name}`;
	};

	return (
		<Button
			variant="outline"
			type="button"
			className="w-full cursor-pointer justify-between shadow-lg shadow-blue-600/10 transition-all duration-300 hover:shadow-blue-600/20"
			{...props}
		>
			<IconComponent />
			{children || getActionText()}
			<div className="w-[0.98em]" />
		</Button>
	);
}
