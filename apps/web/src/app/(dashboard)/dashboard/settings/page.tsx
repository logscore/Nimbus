"use client";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserInfoProvider } from "@/components/providers/user-info-provider";
import { AddAccountDialog } from "@/components/settings/add-account-dialog";
import { capitalizeFirstLetter, type DriveProvider } from "@nimbus/shared";
import { SettingsHeader } from "@/components/dashboard/settings/header";
import { authClient } from "@nimbus/auth/auth-client";
import Profile from "@/components/user-profile";
import { Button } from "@/components/ui/button";
import { unlinkAccount } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import env from "@nimbus/env/client";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
	const { user, accounts, isLoading: isUserLoading } = useUserInfoProvider();
	const [name, setName] = useState(user?.name || "");
	const [email, setEmail] = useState(user?.email || "");
	const [isSaving, setIsSaving] = useState(false);
	// const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(user?.image || null);

	useEffect(() => {
		if (user) {
			setName(user.name || "");
			setEmail(user.email || "");
			setPreviewUrl(user.image || null);
		}
	}, [user]);

	const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// setSelectedFile(file);
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	if (isUserLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
			</div>
		);
	}

	const handleSaveChanges = async () => {
		try {
			setIsSaving(true);

			if (user?.email !== email) {
				await authClient.changeEmail({
					newEmail: email,
					callbackURL: `${env.NEXT_PUBLIC_FRONTEND_URL}/verify-email`,
				});
			}

			if (user?.name !== name || user?.image !== previewUrl) {
				await authClient.updateUser({
					name,
					image: previewUrl,
				});
			}

			toast.success("Profile updated successfully!");
		} catch (error) {
			console.error("Failed to update profile:", error);
			toast.error("Failed to update profile. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDisconnectAccount = async (provider: string, accountId: string) => {
		const toastErrorMessage = `Failed to disconnect ${capitalizeFirstLetter(provider)} account. Account ID: ${accountId}`;
		try {
			const response = await unlinkAccount(provider as DriveProvider, accountId);
			if (response.error) {
				throw new Error(response.error.message || toastErrorMessage);
			}
			toast.success(`Disconnected ${capitalizeFirstLetter(provider)} account`);
		} catch (error) {
			console.error(`Failed to disconnect account`, error);
			toast.error(toastErrorMessage);
		}
	};

	return (
		<div className="flex h-screen flex-col">
			<SettingsHeader
				title="Settings"
				description="Manage your account settings and preferences"
				showBackButton={true}
			/>
			<div className="container mx-auto flex-1 space-y-6 overflow-auto p-4">
				<Card id="profile" className="py-6">
					<CardHeader>
						<CardTitle>Profile Information</CardTitle>
						<CardDescription>Update your profile information and avatar</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-center gap-6">
							<div className="space-y-2 text-center">
								<div className="relative mx-auto">
									<Profile url={previewUrl} name={name} size="xxxxxxl" />
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
									<Button onClick={handleSaveChanges} disabled={isSaving || isUserLoading}>
										{isSaving ? "Saving..." : "Save Changes"}
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Save your profile changes</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</CardFooter>
				</Card>

				<Card id="security" className="py-6">
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

				<Card id="accounts" className="py-6">
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
									<TableHead>Date Added</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{accounts?.map(account => (
									<TableRow key={`${account.provider}-${account.accountId}`}>
										<TableCell className="font-medium capitalize">{account.provider}</TableCell>
										<TableCell>
											{account.createdAt ? new Date(account.createdAt).toLocaleDateString() : "N/A"}
										</TableCell>
										<TableCell className="text-right">
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleDisconnectAccount(account.provider, account.accountId)}
														>
															Disconnect
														</Button>
													</TooltipTrigger>
													<TooltipContent>
														<p>Disconnect {capitalizeFirstLetter(account.provider)} account</p>
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
							onAccountAdded={() => toast.success("Account connected successfully!")}
						/>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
