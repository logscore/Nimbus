import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AddAccountDialog } from "@/components/settings/add-account-dialog";
import { type DriveProvider } from "@nimbus/shared";
import { Check, Loader2, Plus } from "lucide-react";
import type { Account } from "@/hooks/useAccounts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ConnectedAccountsSectionProps {
	accounts: Account[] | null;
	defaultAccountId: string | null;
	isSettingDefault: string | null;
	onDisconnect: (provider: DriveProvider, accountId: string) => void;
	onSetDefault: (provider: DriveProvider, accountId: string) => void;
	isAddAccountDialogOpen: boolean;
	onAddAccountDialogOpenChange: (open: boolean) => void;
}

export function ConnectedAccountsSection({
	accounts,
	defaultAccountId,
	isSettingDefault,
	onDisconnect,
	onSetDefault,
	isAddAccountDialogOpen,
	onAddAccountDialogOpenChange,
}: ConnectedAccountsSectionProps) {
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
							<TableHead>Date Added</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{accounts?.map(account => (
							<TableRow key={`${account.provider}-${account.accountId}`}>
								<TableCell className="font-medium capitalize">
									<div className="flex items-center gap-2">
										{account.provider}
										{defaultAccountId === account.accountId && (
											<Badge variant="default" className="text-xs">
												<Check className="mr-1 h-3 w-3" /> Default
											</Badge>
										)}
									</div>
								</TableCell>
								<TableCell>{account.createdAt ? new Date(account.createdAt).toLocaleDateString() : "N/A"}</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end gap-2">
										{defaultAccountId !== account.accountId && (
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															variant="outline"
															size="sm"
															disabled={isSettingDefault === account.accountId}
															onClick={() => onSetDefault(account.provider as DriveProvider, account.accountId)}
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
														</Button>
													</TooltipTrigger>
													<TooltipContent>
														<p>Set as default account</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										)}

										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="outline"
														size="sm"
														disabled={isSettingDefault === account.accountId}
														onClick={() => onDisconnect(account.provider as DriveProvider, account.accountId)}
													>
														Disconnect
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													<p>Disconnect {account.provider} account</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
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
							<Button variant="outline" onClick={() => onAddAccountDialogOpenChange(true)}>
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
					onOpenChange={onAddAccountDialogOpenChange}
					onAccountAdded={() => {
						// Toast will be handled by the parent
					}}
				/>
			</CardFooter>
		</Card>
	);
}
