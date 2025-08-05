import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BoxIcon, DropboxIcon, GoogleDriveIcon, LogoIcon, OneDriveIcon, S3Icon } from "@/components/icons";
import { useUserInfoProvider } from "@/components/providers/user-info-provider";
import { useAccountProvider } from "@/components/providers/account-provider";
import { useAuth } from "@/components/providers/auth-context";
import type { LimitedAccessAccount } from "@nimbus/shared";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function providerToIcon(providerId: string) {
	switch (providerId) {
		case "google":
			return <GoogleDriveIcon className="h-5 w-5" />;
		case "microsoft":
			return <OneDriveIcon className="h-5 w-5" />;
		case "box":
			return <BoxIcon className="h-5 w-5" />;
		case "dropbox":
			return <DropboxIcon className="h-5 w-5" />;
		case "s3":
			return <S3Icon className="h-5 w-5" />;
		default:
			return <LogoIcon className="h-5 w-5" />;
	}
}

export function SourceSelector() {
	const { accounts, isLoading } = useUserInfoProvider();
	const { providerId, accountId, setDriveProviderById } = useAccountProvider();
	const { openSignIn } = useAuth();
	const [selectedAccountNickname, setSelectedAccountNickname] = useState<string | null>(null);
	const [selectedIcon, setSelectedIcon] = useState(<LogoIcon className="h-5 w-5" />);

	useEffect(() => {
		if (providerId && accountId) {
			const account = accounts?.find(account => account.providerId === providerId && account.accountId === accountId);
			if (account) {
				// Batch state updates to avoid race conditions
				const newNickname = account.nickname;
				const newIcon = providerToIcon(account.providerId);

				setSelectedAccountNickname(newNickname);
				setSelectedIcon(newIcon);
			}
		}
	}, [providerId, accountId, accounts]);

	const handleSourceSelect = (account: LimitedAccessAccount) => {
		setDriveProviderById(account.providerId, account.accountId);
	};

	// Loading state
	if (isLoading || !accounts?.length) {
		return (
			<div className="w-[150px]">
				<Skeleton className="h-9 w-full rounded-lg" />
			</div>
		);
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="flex items-center gap-2 rounded-lg border-0 p-1 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 has-[>svg]:px-2"
						disabled={isLoading}
					>
						<div className="flex items-center gap-2">
							{selectedIcon}
							<span className={cn("truncate", !selectedAccountNickname ? "capitalize" : "")}>
								{selectedAccountNickname || providerId || "Select a source"}
							</span>
						</div>
						<ChevronsUpDown className="h-4 w-4 opacity-50" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-38">
					<ScrollArea className="max-h-60 w-full">
						<div className="space-y-1 p-1">
							{accounts?.length ? (
								accounts?.map(account => (
									<DropdownMenuItem
										key={account.accountId}
										onClick={() => handleSourceSelect(account)}
										className="flex cursor-pointer items-center gap-2 font-medium"
									>
										<div className="flex h-6 w-6 items-center justify-center rounded-md bg-white">
											{providerToIcon(account.providerId)}
										</div>
										{account.nickname ? (
											<span className="truncate overflow-x-clip">{account.nickname}</span>
										) : (
											<span className="truncate overflow-x-clip capitalize">{account.providerId}</span>
										)}
									</DropdownMenuItem>
								))
							) : (
								<DropdownMenuItem disabled>
									<span className="text-neutral-500">Sources</span>
								</DropdownMenuItem>
							)}
						</div>
					</ScrollArea>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={openSignIn} className="flex cursor-pointer items-center gap-2 font-medium">
						<Plus className="h-4 w-4" />
						<span>Add source</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
