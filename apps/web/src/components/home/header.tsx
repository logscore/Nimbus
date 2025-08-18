"use client";

import { DiscordIcon, GitHubIcon, LogoIcon, XPlatformIcon } from "@/components/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { authClient } from "@nimbus/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import Link from "next/link";

export default function Header() {
	return (
		<header className="border-border bg-surface/80 fixed top-4 left-1/2 z-50 mx-auto flex w-full max-w-xs -translate-x-1/2 items-center justify-between rounded-lg border px-4 py-2 backdrop-blur-xs md:max-w-2xl">
			<h1>
				<Link href="/" className="hover:text-primary/80 flex items-center gap-2 font-bold transition-colors">
					<span>
						<LogoIcon className="h-9 w-9" aria-hidden="true" />
					</span>
					<span className="hidden md:inline">Nimbus</span>
				</Link>
			</h1>
			<div className="flex items-center gap-1">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" asChild aria-label="Contributors" className="h-9 w-9">
							<Link href="/contributors">
								<Users className="h-5 w-5" />
							</Link>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Contributors</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" asChild aria-label="Discord" className="h-9 w-9">
							<a href="https://discord.gg/c9nWy26ubK" target="_blank" rel="noopener noreferrer">
								<DiscordIcon />
							</a>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Discord</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" asChild className="h-9 w-9">
							<a href="https://github.com/nimbusdotstorage/Nimbus" target="_blank" rel="noopener noreferrer">
								<GitHubIcon />
							</a>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Github</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" aria-label="X (Twitter)" className="h-9 w-9">
							<a href="https://x.com/nimbusdotcloud" target="_blank" rel="noopener noreferrer">
								<XPlatformIcon />
							</a>
						</Button>
					</TooltipTrigger>
					<TooltipContent>X (Twitter)</TooltipContent>
				</Tooltip>
				{!authClient.useSession().data?.session ? (
					<Button asChild aria-label="Sign in">
						<Link href="/signin" className="ml-4 font-semibold">
							Sign In
						</Link>
					</Button>
				) : (
					<Button asChild aria-label="Go to Nimbus dashboard">
						<Link href="/dashboard" className="font-semibold">
							Go to Nimbus
						</Link>
					</Button>
				)}
			</div>
		</header>
	);
}
