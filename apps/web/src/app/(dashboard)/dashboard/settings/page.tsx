"use client";

import { type ApiResponse, type DriveProvider } from "@nimbus/shared";
import { LoadingStatePage } from "@/components/loading-state-page";
import { authClient } from "@nimbus/auth/auth-client";
import { useEffect, useState } from "react";
import env from "@nimbus/env/client";
import { toast } from "sonner";

import { useDefaultAccountProvider } from "@/components/providers/default-account-provider";
import { useUserInfoProvider } from "@/components/providers/user-info-provider";
import { protectedClient } from "@/utils/client";
import { unlinkAccount } from "@/hooks/useAuth";

import { ConnectedAccountsSection } from "@/components/settings/connected-accounts-section";
import { SecuritySection } from "@/components/settings/security-section";
import { ProfileSection } from "@/components/settings/profile-section";
import { SettingsHeader } from "@/components/settings/header";
import { capitalizeFirstLetter } from "@nimbus/shared";

// TODO(feat): back button in header goes to a callbackUrl

export default function SettingsPage() {
	const { user, accounts, error, isLoading, refreshUser } = useUserInfoProvider();
	const { defaultAccountId } = useDefaultAccountProvider();
	const [name, setName] = useState(user?.name || "");
	const [email, setEmail] = useState(user?.email || "");
	const [isSaving, setIsSaving] = useState(false);
	const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(user?.image || null);
	const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false);

	useEffect(() => {
		if (user) {
			setName(user.name || "");
			setEmail(user.email || "");
			setPreviewUrl(user.image || null);
		}
	}, [user]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

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

	const handleDisconnectAccount = async (provider: DriveProvider, accountId: string) => {
		const toastErrorMessage = `Failed to disconnect ${capitalizeFirstLetter(provider)} account. Account ID: ${accountId}`;
		try {
			if (defaultAccountId === accountId) {
				toast.error("Cannot disconnect the default account. Set another account as default first.");
				return;
			}

			const response = await unlinkAccount(provider, accountId);
			if (response.error) {
				throw new Error(response.error.message || toastErrorMessage);
			}
			await refreshUser();
			toast.success(`Disconnected ${capitalizeFirstLetter(provider)} account`);
		} catch (error) {
			console.error(`Failed to disconnect account`, error);
			toast.error(toastErrorMessage);
		}
	};

	const handleSetDefaultAccount = async (provider: DriveProvider, accountId: string) => {
		setIsSettingDefault(accountId);
		const toastErrorMessage = `Failed to set ${capitalizeFirstLetter(provider)} as default account`;

		try {
			const response = await protectedClient.api.user.$put({
				json: {
					defaultProviderId: provider,
					defaultAccountId: accountId,
				},
			});

			if (!response.ok) {
				const data = (await response.json()) as unknown as ApiResponse;
				throw new Error(data.message || "Failed to update default account");
			}

			await refreshUser();
			toast.success(`${capitalizeFirstLetter(provider)} account set as default`);
		} catch (error) {
			console.error("Failed to set default account:", error);
			toast.error(toastErrorMessage);
		} finally {
			setIsSettingDefault(null);
		}
	};

	if (isLoading || error) {
		return <LoadingStatePage error={error} />;
	}

	return (
		<div className="flex h-screen flex-1 flex-col">
			<SettingsHeader
				title="Settings"
				description="Manage your account settings and preferences"
				showBackButton={true}
			/>
			<div className="container mx-auto flex-1 space-y-6 p-6">
				<ProfileSection
					name={name}
					email={email}
					previewUrl={previewUrl}
					onNameChange={setName}
					onEmailChange={setEmail}
					onFileChange={handleFileChange}
					onSave={handleSaveChanges}
					isSaving={isSaving}
				/>

				<ConnectedAccountsSection
					accounts={accounts}
					defaultAccountId={defaultAccountId}
					isSettingDefault={isSettingDefault}
					onDisconnect={handleDisconnectAccount}
					onSetDefault={handleSetDefaultAccount}
					isAddAccountDialogOpen={isAddAccountDialogOpen}
					onAddAccountDialogOpenChange={setIsAddAccountDialogOpen}
				/>

				<SecuritySection />
			</div>
		</div>
	);
}
