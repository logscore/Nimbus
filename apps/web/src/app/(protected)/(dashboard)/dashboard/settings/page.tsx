"use client";

import { type ApiResponse, type DriveProvider } from "@nimbus/shared";
import { useEffect, useState, type ChangeEvent } from "react";
import { authClient } from "@nimbus/auth/auth-client";
import env from "@nimbus/env/client";
import { toast } from "sonner";

import { useDefaultAccountProvider } from "@/components/providers/default-account-provider";
import { useUserInfoProvider } from "@/components/providers/user-info-provider";
import { useUnlinkAccount } from "@/hooks/useUnlinkAccount";
import { useSubscription } from "@/hooks/useSubscription";
import { protectedClient } from "@/utils/client";

import { ConnectedAccountsSection } from "@/components/settings/connected-accounts-section";
import { SubscriptionInfo } from "@/components/subscription/subscription-info";
import { UpgradeDialog } from "@/components/subscription/upgrade-dialog";
// import { SecuritySection } from "@/components/settings/security-section";
import { ProfileSection } from "@/components/settings/profile-section";
import { SettingsHeader } from "@/components/settings/header";

// TODO(feat): back button in header goes to a callbackUrl

export default function SettingsPage() {
	const { user, accounts, refreshUser, refreshAccounts } = useUserInfoProvider();
	const { defaultAccountId } = useDefaultAccountProvider();
	const { unlinkAccount } = useUnlinkAccount();
	const {
		subscription,
		connectionCount,
		maxConnections,
		canAddConnection,
		isActive,
		refetch: refetchSubscription,
	} = useSubscription();
	const [name, setName] = useState(user?.name || "");
	const [email, setEmail] = useState(user?.email || "");
	const [isSaving, setIsSaving] = useState(false);
	const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(user?.image || null);
	const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

	useEffect(() => {
		if (user) {
			// Batch state updates to avoid race conditions
			const newName = user.name || "";
			const newEmail = user.email || "";
			const newPreviewUrl = user.image || null;

			setName(newName);
			setEmail(newEmail);
			setPreviewUrl(newPreviewUrl);
		}
	}, [user]);

	// TODO(feat): change profile image
	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleSaveProfile = async () => {
		try {
			setIsSaving(true);
			let isUpdated = false;

			if (user?.email !== email) {
				await authClient.changeEmail({
					newEmail: email,
					callbackURL: `${env.NEXT_PUBLIC_FRONTEND_URL}/verify-email`,
				});
				isUpdated = true;
			}

			if (user?.name !== name || user?.image !== previewUrl) {
				await authClient.updateUser({
					name,
					image: previewUrl,
				});
				isUpdated = true;
			}

			if (isUpdated) {
				await refreshUser();
				toast.success("Profile updated successfully");
			}
		} catch (error) {
			console.error("Failed to update profile:", error);
			toast.error("Failed to update profile. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDisconnectAccount = async (provider: DriveProvider, accountId: string) => {
		const toastErrorMessage = `Failed to disconnect account. Account ID: ${accountId}`;

		try {
			const response = await unlinkAccount(provider, accountId);
			if (response?.error) {
				throw new Error(response.error.message || toastErrorMessage);
			}
			await refreshAccounts();
			toast.success(`Disconnected account`);
		} catch (error) {
			console.error(`Failed to disconnect account`, error);
			toast.error(toastErrorMessage);
		}
	};

	const handleSetDefaultAccount = async (provider: DriveProvider, accountId: string) => {
		setIsSettingDefault(accountId);
		const toastErrorMessage = `Failed to set default account. Account ID: ${accountId}`;

		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const response = await (protectedClient as any).api.user.$put({
				json: {
					defaultProviderId: provider,
					defaultAccountId: accountId,
				},
			});
			if (!response.ok) {
				const data = (await response.json()) as unknown as ApiResponse;
				throw new Error(data.message || toastErrorMessage);
			}
			await refreshAccounts();
			toast.success(`Account set as default`);
		} catch (error) {
			console.error("Failed to set default account:", error);
			toast.error(toastErrorMessage);
		} finally {
			setIsSettingDefault(null);
		}
	};

	const handleUpdateAccount = async (
		provider: DriveProvider,
		accountId: string,
		tableAccountId: string,
		nickname: string
	) => {
		const toastErrorMessage = `Failed to update account. Account ID: ${accountId}`;

		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const response = await (protectedClient as any).api.account.$put({
				json: {
					id: tableAccountId,
					nickname,
				},
			});
			if (!response.ok) {
				const data = (await response.json()) as unknown as ApiResponse;
				throw new Error(data.message || toastErrorMessage);
			}
			await refreshAccounts();
			toast.success(`Account updated`);
		} catch (error) {
			console.error("Failed to update account:", error);
			toast.error(toastErrorMessage);
		}
	};

	return (
		<div className="flex flex-1 flex-col">
			<SettingsHeader />
			<div className="container mx-auto flex-1 space-y-6 p-6">
				<ProfileSection
					name={name}
					email={email}
					previewUrl={previewUrl}
					onNameChange={setName}
					onEmailChange={setEmail}
					onFileChange={handleFileChange}
					onSave={handleSaveProfile}
					isSaving={isSaving}
				/>

				{subscription && (
					<SubscriptionInfo
						subscription={subscription}
						connectionCount={connectionCount}
						maxConnections={maxConnections}
						canAddConnection={canAddConnection}
						isActive={isActive}
						onUpgradeClick={() => setShowUpgradeDialog(true)}
					/>
				)}

				<ConnectedAccountsSection
					accounts={accounts}
					defaultAccountId={defaultAccountId}
					isSettingDefault={isSettingDefault}
					onDisconnect={handleDisconnectAccount}
					onSetDefault={handleSetDefaultAccount}
					onUpdateAccount={handleUpdateAccount}
				/>

				{/*<SecuritySection />*/}
			</div>

			{subscription && (
				<UpgradeDialog
					open={showUpgradeDialog}
					onOpenChange={setShowUpgradeDialog}
					currentPlan={subscription.plan}
					currentConnectionCount={connectionCount}
					maxConnections={maxConnections}
				/>
			)}
		</div>
	);
}
