import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function SecuritySection() {
	return (
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
	);
}
