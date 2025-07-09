import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { authClient } from "@nimbus/auth/auth-client";
import Profile from "@/components/user-profile";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function UserProfileDropdown() {
	const router = useRouter();
	const { signOut, isLoading } = useSignOut();
	const { data: session, isPending } = authClient.useSession();

	const userImage = session?.user?.image || null;
	const userName = session?.user?.name || null;
	const userEmail = session?.user?.email || null;

	const handleSignOut = async () => {
		try {
			await signOut();
			toast.success("Signed out successfully");
			router.push("/signin");
		} catch (error) {
			console.error("Failed to sign out:", error);
			toast.error("Failed to sign out");
		}
	};

	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="h-9 w-9 cursor-pointer rounded-full">
							<Profile url={userImage} name={userName || ""} size="sm" />
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent side="bottom">{userName ? `${userName}'s profile` : "User profile"}</TooltipContent>
			</Tooltip>
			<DropdownMenuContent align="end">
				{isPending ? (
					<DropdownMenuItem>Loading...</DropdownMenuItem>
				) : userName ? (
					<>
						<DropdownMenuLabel>My Account</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="flex cursor-default flex-col items-start focus:bg-transparent">
							<div className="font-medium">{userName || "User"}</div>
							<div className="text-muted-foreground text-xs">{userEmail || "No email"}</div>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleSignOut} className="cursor-pointer" disabled={isLoading}>
							<LogOut className="mr-2 h-4 w-4" />
							<span>{isLoading ? "Signing out..." : "Sign Out"}</span>
						</DropdownMenuItem>
					</>
				) : (
					<DropdownMenuItem asChild className="cursor-pointer">
						<Link href="/signin">Sign in</Link>
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
