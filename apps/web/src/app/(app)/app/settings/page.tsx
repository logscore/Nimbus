"use client";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddAccountDialog } from "@/components/settings/add-account-dialog";
import { authClient } from "@nimbus/auth/auth-client";
import type { SocialProvider } from "@nimbus/shared";
import { AppHeader } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ConnectedAccount = {
	provider: SocialProvider;
	email: string;
	dateAdded: string;
};

export default function SettingsPage() {
	const { data: session } = authClient.useSession();
	const [name, setName] = useState(session?.user?.name || "");
	const [email, setEmail] = useState(session?.user?.email || "");
	const [isLoading, setIsLoading] = useState(false);
	// const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(session?.user?.image || null);

	// Mock data for connected accounts
	const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([
		{ provider: "google", email: session?.user?.email || "", dateAdded: "2023-01-15" },
		// Add more connected accounts as needed
	]);

	const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// setSelectedFile(file);
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleSaveChanges = async () => {
		try {
			setIsLoading(true);
			// TODO: Implement actual API calls to update user data
			await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

			// Update session with new data
			// TODO(auth): figure out how to update the session
			// await authClient.multiSession.updateSession({
			//   ...session,
			//   user: {
			//     ...session?.user,
			//     name,
			//     email,
			//     image: previewUrl || session?.user?.image,
			//   },
			// });

			toast.success("Profile updated successfully!");
		} catch (error) {
			console.error("Failed to update profile:", error);
			toast.error("Failed to update profile. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDisconnectAccount = (provider: SocialProvider) => {
		// TODO: Implement actual disconnect logic
		setConnectedAccounts(prev => prev.filter(acc => acc.provider !== provider));
		toast.success(`Disconnected ${provider} account`);
	};

	return (
		<div className="flex h-screen flex-col">
			<AppHeader title="Settings" description="Manage your account settings and preferences" showBackButton={true} />
			<div className="container mx-auto flex-1 space-y-6 overflow-auto p-4">
				<Tabs defaultValue="profile" className="space-y-4">
					<TabsList>
						<TabsTrigger value="profile">Profile</TabsTrigger>
						<TabsTrigger value="security">Security</TabsTrigger>
						<TabsTrigger value="connected-accounts">Connected Accounts</TabsTrigger>
					</TabsList>

					<TabsContent value="profile" className="space-y-4">
						<Card className="py-6">
							<CardHeader>
								<CardTitle>Profile Information</CardTitle>
								<CardDescription>Update your profile information and avatar</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex items-center gap-6">
									<div className="space-y-2 text-center">
										<div className="relative mx-auto">
											<Avatar className="h-24 w-24">
												<AvatarImage src={previewUrl || undefined} alt={name} />
												<AvatarFallback className="text-2xl">{name?.slice(0, 2).toUpperCase() || "US"}</AvatarFallback>
											</Avatar>
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<label
															htmlFor="avatar-upload"
															className="bg-primary text-primary-foreground hover:bg-primary/90 absolute -right-2 -bottom-2 cursor-pointer rounded-full p-2"
														>
															<input
																id="avatar-upload"
																type="file"
																className="hidden"
																accept="image/*"
																onChange={handleFileChange}
															/>

															<Plus className="h-4 w-4" />
														</label>
													</TooltipTrigger>
													<TooltipContent>
														<p>Upload new photo</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</div>
										<p className="text-muted-foreground text-sm">Click to change photo</p>
									</div>

									<div className="flex-1 space-y-4">
										<div className="space-y-2">
											<Label htmlFor="name">Full Name</Label>
											<Input
												id="name"
												value={name}
												onChange={e => setName(e.target.value)}
												placeholder="Enter your full name"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												type="email"
												value={email}
												onChange={e => setEmail(e.target.value)}
												placeholder="Enter your email"
											/>
										</div>
									</div>
								</div>
							</CardContent>
							<CardFooter className="flex justify-end">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button onClick={handleSaveChanges} disabled={isLoading}>
												{isLoading ? "Saving..." : "Save Changes"}
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Save your profile changes</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</CardFooter>
						</Card>
					</TabsContent>

					<TabsContent value="security">
						<Card className="py-6">
							<CardHeader>
								<CardTitle>Security</CardTitle>
								<CardDescription>Update your password and security settings</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="current-password">Current Password</Label>
									<Input id="current-password" type="password" placeholder="Enter current password" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="new-password">New Password</Label>
									<Input id="new-password" type="password" placeholder="Enter new password" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="confirm-password">Confirm New Password</Label>
									<Input id="confirm-password" type="password" placeholder="Confirm new password" />
								</div>
							</CardContent>
							<CardFooter className="flex justify-end">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button>Update Password</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Update your account password</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</CardFooter>
						</Card>
					</TabsContent>

					<TabsContent value="connected-accounts">
						<Card className="py-6">
							<CardHeader>
								<CardTitle>Connected Accounts</CardTitle>
								<CardDescription>Manage your connected social accounts</CardDescription>
							</CardHeader>
							<CardContent>
								<Table>
									<TableCaption>A list of your connected accounts</TableCaption>
									<TableHeader>
										<TableRow>
											<TableHead>Provider</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>Date Added</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{connectedAccounts.map(account => (
											<TableRow key={`${account.provider}-${account.email}`}>
												<TableCell className="font-medium capitalize">{account.provider}</TableCell>
												<TableCell>{account.email}</TableCell>
												<TableCell>{new Date(account.dateAdded).toLocaleDateString()}</TableCell>
												<TableCell className="text-right">
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => handleDisconnectAccount(account.provider)}
																>
																	Disconnect
																</Button>
															</TooltipTrigger>
															<TooltipContent>
																<p>Disconnect {account.provider} account</p>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardContent>
							<CardFooter className="flex justify-between">
								<p className="text-muted-foreground text-sm">
									Connect additional accounts to sign in with different providers
								</p>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button variant="outline" onClick={() => setIsAddAccountDialogOpen(true)}>
												<Plus className="mr-2 h-4 w-4" />
												Add Account
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Connect a new social account</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<AddAccountDialog
									open={isAddAccountDialogOpen}
									onOpenChange={setIsAddAccountDialogOpen}
									onAccountAdded={() => {
										// Refresh the connected accounts list when a new account is added
										// TODO: Replace with actual API call to fetch connected accounts
										toast.success("Account connected successfully!");
									}}
								/>
							</CardFooter>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
