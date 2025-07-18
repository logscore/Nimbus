import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Profile from "@/components/user-profile";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface ProfileSectionProps {
	name: string;
	email: string;
	previewUrl: string | null;
	onNameChange: (name: string) => void;
	onEmailChange: (email: string) => void;
	onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSave: () => void;
	isSaving: boolean;
}

export function ProfileSection({
	name,
	email,
	previewUrl,
	onNameChange,
	onEmailChange,
	onFileChange,
	onSave,
	isSaving,
}: ProfileSectionProps) {
	return (
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
												onChange={onFileChange}
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
								onChange={e => onNameChange(e.target.value)}
								placeholder="Enter your full name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={e => onEmailChange(e.target.value)}
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
							<Button onClick={onSave} disabled={isSaving}>
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
	);
}
