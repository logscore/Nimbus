import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function SettingsHeader() {
	const router = useRouter();
	return (
		<header className="bg-background flex h-16 items-center border-b p-4">
			<div className="flex items-center gap-2">
				<Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => router.push("/dashboard")}>
					<ArrowLeft className="h-5 w-5" />
					<span className="sr-only">Back</span>
				</Button>

				<div className="ml-2">
					<h1 className="text-lg font-semibold">Settings</h1>
					<p className="text-muted-foreground text-xs">Manage your account settings and preferences</p>
				</div>
			</div>
		</header>
	);
}
