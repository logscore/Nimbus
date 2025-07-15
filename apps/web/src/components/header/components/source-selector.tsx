import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserInfoProvider } from "@/components/providers/user-info-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { authClient } from "@nimbus/auth/auth-client";
import { ChevronsUpDown, Plus } from "lucide-react";
import GoogleDriveIcon from "@/public/googledrive";
import { Button } from "@/components/ui/button";
import { NimbusLogo } from "@/components/icons";
import OneDriveIcon from "@/public/onedrive";
import { useState } from "react";

const accounts = await authClient.listAccounts();
interface Account {
	provider: string;
	accountId: string;
}

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
	const context = useUserInfoProvider();

	if (!context) {
		throw new Error("SourceSelector must be used within a UserInfoProvider");
	}

	const [selectedSource, setSelectedSource] = useState("Connect a source");
	const [selectedIcon, setSelectedIcon] = useState(<NimbusLogo className="h-5 w-5 text-black" />);

	const handleSourceSelect = (source: Account) => {
		const providerId = source.provider;
		const accountId = source.accountId;
		context.navigateToProvider(providerId, accountId);
		setSelectedSource(providerId);
		setSelectedIcon(providerToIcon(providerId));
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="flex items-center gap-2 rounded-xl p-1 has-[>svg]:px-2">
					<div className="flex h-6 w-6 items-center justify-center rounded-md bg-white">{selectedIcon}</div>
					<span className="text-md leading-normal font-medium text-neutral-100 capitalize">{selectedSource}</span>
					<ChevronsUpDown
						style={{ height: "14px", width: "14px" }}
						className="flex h-3 w-3 items-center justify-center gap-2.5 font-bold text-neutral-400"
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-34">
				<ScrollArea className="h-32">
					<div className="p-1">
						{accounts.data && accounts.data.length > 0 ? (
							accounts.data.map((account, index) => (
								<DropdownMenuItem
									key={index}
									onClick={() => handleSourceSelect(account)}
									className="flex cursor-pointer items-center gap-2 font-medium capitalize"
								>
									<div className="flex h-6 w-6 items-center justify-center rounded-md bg-white">
										{providerToIcon(account.provider)}
									</div>
									<span>{account.provider}</span>
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
