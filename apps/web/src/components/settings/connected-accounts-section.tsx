import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Check, Edit, Loader2, Plus, X } from "lucide-react";
import { nicknameSchema, type DriveProvider } from "@nimbus/shared";
import { useAuth } from "@/components/providers/auth-provider";
import type { LimitedAccessAccount } from "@nimbus/shared";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConnectedAccountsSectionProps {
	accounts: LimitedAccessAccount[] | null;
	defaultAccountId: string | null;
	isSettingDefault: string | null;
	onDisconnect: (provider: DriveProvider, accountId: string) => void;
	onSetDefault: (provider: DriveProvider, accountId: string) => void;
	onUpdateAccount: (
		providerId: DriveProvider,
		accountId: string,
		tableAccountId: string,
		nickname: string
	) => Promise<void>;
}

interface EditingState {
	id: string;
	nickname: string;
}

interface NicknameInputProps {
	value: string;
	onChange: (value: string) => void;
	onSave: () => void;
	onCancel: () => void;
	error?: string | null;
	maxLength?: number;
	autoFocus?: boolean;
	isSuccess?: boolean;
}

const NicknameInput = ({
	value,
	onChange,
	onSave,
	onCancel,
	error,
	maxLength = 50,
	autoFocus = true,
	isSuccess = false,
}: NicknameInputProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const remainingChars = maxLength - value.length;

	useEffect(() => {
		if (autoFocus && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [autoFocus]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			onSave();
		} else if (e.key === "Escape") {
			e.preventDefault();
			onCancel();
		}
	};

	return (
		<div className="w-full">
			<div className="relative">
				<Input
					ref={inputRef}
					value={value}
					onChange={e => onChange(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Enter nickname"
					className={cn(
						"h-8 w-full pr-8 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
						error && "border-destructive",
						isSuccess && "border-green-500"
					)}
					aria-invalid={!!error}
					aria-describedby={error ? "nickname-error" : undefined}
					maxLength={maxLength}
				/>
				{/* Success checkmark or cancel X */}
				<div className="absolute top-1/2 right-2 -translate-y-1/2">
					{isSuccess ? (
						<Check className="h-4 w-4 text-green-500" />
					) : (
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 p-0 hover:bg-transparent"
							onClick={onCancel}
							aria-label="Cancel editing"
						>
							<X className="text-muted-foreground hover:text-destructive h-4 w-4" />
						</Button>
					)}
				</div>
				{/* Character counter - positioned absolutely relative to input */}
				<div className="text-muted-foreground absolute -bottom-5 left-0 text-xs">
					{remainingChars} characters remaining
				</div>
			</div>
			{/* Error message with proper spacing */}
			{error && (
				<p className="text-destructive mt-6 flex items-center gap-1 text-xs" id="nickname-error" role="alert">
					<AlertCircle className="h-3 w-3" />
					{error}
				</p>
			)}
		</div>
	);
};

export function ConnectedAccountsSection({
	accounts,
	defaultAccountId,
	isSettingDefault,
	onDisconnect,
	onSetDefault,
	onUpdateAccount,
}: ConnectedAccountsSectionProps) {
	const { openSignIn } = useAuth();
	const [editing, setEditing] = useState<EditingState | null>(null);
	const [validationError, setValidationError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [successStates, setSuccessStates] = useState<Set<string>>(new Set());

	const handleEdit = (account: LimitedAccessAccount) => {
		setEditing({ id: account.id, nickname: account.nickname || "" });
		setValidationError(null);
		// Clear any existing success state for this account
		setSuccessStates(prev => {
			const newSet = new Set(prev);
			newSet.delete(account.id);
			return newSet;
		});
	};

	const handleSave = async (provider: DriveProvider, accountId: string, tableAccountId: string) => {
		if (!editing) return;

		// Validate input
		const parseResult = nicknameSchema.safeParse(editing.nickname);
		if (!parseResult.success) {
			const issue = parseResult.error.issues[0];
			setValidationError(issue?.message || "Nickname is required");
			return;
		}

		try {
			setIsSaving(true);
			await onUpdateAccount(provider, accountId, tableAccountId, editing.nickname.trim());

			// Show success state
			setSuccessStates(prev => new Set(prev).add(tableAccountId));
			setValidationError(null);

			// Clear success state and editing after a delay
			setTimeout(() => {
				setSuccessStates(prev => {
					const newSet = new Set(prev);
					newSet.delete(tableAccountId);
					return newSet;
				});
				setEditing(null);
			}, 1500);
		} catch (error) {
			console.error("Failed to update account nickname:", error);
			setValidationError("Failed to save changes. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		setEditing(null);
		setValidationError(null);
		// Clear any success states
		if (editing) {
			setSuccessStates(prev => {
				const newSet = new Set(prev);
				newSet.delete(editing.id);
				return newSet;
			});
		}
	};

	const handleNicknameChange = (value: string) => {
		if (editing) {
			setEditing({ ...editing, nickname: value });
			// Clear validation error when user starts typing again
			if (validationError) {
				try {
					nicknameSchema.parse(value);
					setValidationError(null);
				} catch {
					// Keep the existing error if validation still fails
				}
			}
		}
	};

	return (
		<Card id="accounts" className="py-6">
			<CardHeader>
				<CardTitle>Connected Accounts</CardTitle>
				<CardDescription>Manage your connected social accounts</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Provider</TableHead>
							<TableHead>Nickname</TableHead>
							<TableHead>Date Added</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{accounts?.map(account => (
							<TableRow key={`${account.providerId}-${account.accountId}`} className="group">
								<TableCell className="font-medium capitalize">
									<div className="flex items-center gap-2">
										{account.providerId}
										{defaultAccountId === account.accountId && (
											<Badge variant="default" className="text-xs">
												<Check className="mr-1 h-3 w-3" /> Default
											</Badge>
										)}
									</div>
								</TableCell>
								<TableCell className="relative w-60">
									{editing?.id === account.id ? (
										<NicknameInput
											value={editing.nickname}
											onChange={handleNicknameChange}
											onSave={() => handleSave(account.providerId as DriveProvider, account.accountId, account.id)}
											onCancel={handleCancel}
											error={validationError}
											maxLength={50}
											isSuccess={successStates.has(account.id)}
										/>
									) : (
										<div className="flex items-center justify-between">
											<span>{account.nickname || "—"}</span>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 opacity-0 group-hover:opacity-100"
												onClick={() => handleEdit(account)}
												aria-label={`Edit ${account.nickname || "unnamed account"}`}
											>
												<Edit className="h-4 w-4" />
											</Button>
										</div>
									)}
								</TableCell>
								<TableCell>{account.createdAt ? new Date(account.createdAt).toLocaleDateString() : "N/A"}</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end gap-2">
										{defaultAccountId !== account.accountId && (
											<Button
												variant="outline"
												size="sm"
												disabled={isSettingDefault === account.accountId}
												onClick={() => onSetDefault(account.providerId as DriveProvider, account.accountId)}
											>
												{isSettingDefault === account.accountId ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Setting...
													</>
												) : (
													<>
														<Check className="mr-2 h-4 w-4" />
														Set as Default
													</>
												)}
												<span className="sr-only">Set {account.nickname || "this account"} as default</span>
											</Button>
										)}

										<Button
											variant="outline"
											size="sm"
											disabled={defaultAccountId === account.accountId || isSettingDefault === account.accountId}
											onClick={() => onDisconnect(account.providerId as DriveProvider, account.accountId)}
										>
											{isSaving ? "Disconnecting..." : "Disconnect"}
											<span className="sr-only">Disconnect {account.nickname || "unnamed account"}</span>
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
			<CardFooter className="flex justify-between">
				<Button variant="outline" onClick={openSignIn}>
					<Plus className="mr-2 h-4 w-4" />
					Add Account
				</Button>
			</CardFooter>
		</Card>
	);
}
