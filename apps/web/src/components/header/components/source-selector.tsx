import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserInfoProvider } from "@/components/providers/user-info-provider";
import { useAccountProvider } from "@/components/providers/account-provider";
import type { LimitedAccessAccount } from "@nimbus/shared";
import { ScrollArea } from "@/components/ui/scroll-area";
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
	const [selectedAccountNickname, setSelectedAccountNickname] = useState<string | null>(null);
	const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
	const [selectedIcon, setSelectedIcon] = useState(<NimbusLogo className="h-5 w-5 text-black" />);

	useEffect(() => {
		if (providerId && accountId) {
			const account = accounts?.find(account => account.providerId === providerId && account.accountId === accountId);
			if (account) {
				setSelectedAccountNickname(account.nickname);
				setSelectedProviderId(account.providerId);
				setSelectedIcon(providerToIcon(account.providerId));
			}
		}
	}, [providerId, accountId, accounts]);

	const handleSourceSelect = (account: LimitedAccessAccount) => {
		setDriveProviderById(account.providerId, account.accountId);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="flex items-center gap-2 rounded-xl p-1 has-[>svg]:px-2" disabled={isLoading}>
					{isLoading ? (
						<div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
					) : (
						<div className="flex h-6 w-6 items-center justify-center rounded-md bg-white">{selectedIcon}</div>
					)}
					<span className="text-md leading-normal font-medium dark:text-neutral-100">
						{isLoading ? (
							"Loading..."
						) : selectedAccountNickname ? (
							<span>{selectedAccountNickname}</span>
						) : (
							<span className="capitalize">{selectedProviderId}</span>
						)}
					</span>
					{!isLoading && (
						<ChevronsUpDown
							style={{ height: "14px", width: "14px" }}
							className="flex h-3 w-3 items-center justify-center gap-2.5 font-bold text-neutral-400 dark:text-neutral-200"
						/>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-34">
				<ScrollArea className="h-32">
					<div className="p-1">
						{accounts && accounts.length > 0 ? (
							accounts.map((account, index) => (
								<DropdownMenuItem
									key={index}
									onClick={() => handleSourceSelect(account)}
									className="flex cursor-pointer items-center gap-2 font-medium"
								>
									<div className="flex h-6 w-6 items-center justify-center rounded-md bg-white">
										{providerToIcon(account.providerId)}
									</div>
									{account.nickname ? (
										<span>{account.nickname}</span>
									) : (
										<span className="capitalize">{account.providerId}</span>
									)}
								</DropdownMenuItem>
							))
						) : (
							<DropdownMenuItem disabled>
								<span className="text-neutral-500">No sources available</span>
							</DropdownMenuItem>
						)}
					</div>
				</ScrollArea>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => console.log("Add source")}
					className="flex cursor-pointer items-center gap-2 font-medium"
				>
					<Plus className="h-4 w-4" />
					<span>Add source</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
