import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserInfoProvider } from "@/components/providers/user-info-provider";
import { useAccountProvider } from "@/components/providers/account-provider";
import { AddAccountDialog } from "@/components/settings/add-account-dialog";
import type { LimitedAccessAccount } from "@nimbus/shared";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronsUpDown, Plus } from "lucide-react";
import GoogleDriveIcon from "@/public/googledrive";
import { Button } from "@/components/ui/button";
import { NimbusLogo } from "@/components/icons";
import OneDriveIcon from "@/public/onedrive";
import { useEffect, useState } from "react";

export function providerToIcon(providerId: string) {
	switch (providerId) {
		case "google":
			return <GoogleDriveIcon className="h-5 w-5" />;
		case "microsoft":
			return <OneDriveIcon className="h-5 w-5" />;
		default:
			return <NimbusLogo className="h-5 w-5 text-black" />;
	}
}

export function SourceSelector() {
	const { accounts, isLoading } = useUserInfoProvider();
	const { providerId, accountId, setDriveProviderById } = useAccountProvider();
	const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false);
	const [selectedAccountNickname, setSelectedAccountNickname] = useState<string | null>(null);
	const [selectedIcon, setSelectedIcon] = useState(<NimbusLogo className="h-5 w-5 text-black" />);

	useEffect(() => {
		if (providerId && accountId) {
			const account = accounts?.find(account => account.providerId === providerId && account.accountId === accountId);
			if (account) {
				setSelectedAccountNickname(account.nickname);
				setSelectedIcon(providerToIcon(account.providerId));
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
						className="has-[>svg]:px-2ring-0 flex items-center gap-2 rounded-lg border-0 p-1 focus-visible:ring-0 focus-visible:ring-offset-0"
						disabled={isLoading}
					>
						<div className="flex items-center gap-2">
							{selectedIcon}
							<span className="truncate">{selectedAccountNickname || "Select a source"}</span>
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
					<DropdownMenuItem
						onClick={() => setIsAddAccountDialogOpen(true)}
						className="flex cursor-pointer items-center gap-2 font-medium"
					>
						<Plus className="h-4 w-4" />
						<span>Add source</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<AddAccountDialog
				open={isAddAccountDialogOpen}
				onOpenChange={setIsAddAccountDialogOpen}
				onAccountAdded={() => {
					// Refresh accounts list or update UI as needed
				}}
			/>
		</>
	);
}
