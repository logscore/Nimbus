import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HeaderTitle } from "../../header/components/header-title";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsHeaderProps {
	title: string;
	description?: string;
	showBackButton?: boolean;
	className?: string;
}

export function SettingsHeader({ title, description, showBackButton = false, className }: SettingsHeaderProps) {
	const router = useRouter();
	return (
		<header className={cn("bg-background flex h-16 items-center border-b px-4", className)}>
			<div className="flex items-center gap-2">
				{showBackButton && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => router.back()}>
								<ArrowLeft className="h-5 w-5" />
								<span className="sr-only">Back</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">Go back</TooltipContent>
					</Tooltip>
				)}
				<HeaderTitle title={title} description={description} />
			</div>
		</header>
	);
}
