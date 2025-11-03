import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LoadingStatePageProps {
	title?: string;
	description?: string;
	errorTitle?: string;
	errorDescription?: string;
	error: Error | null;
}

export function LoadingStatePage({
	title = "Loading...",
	description = "Please wait while we load your content.",
	errorTitle = "Something went wrong",
	errorDescription = "Please try again.",
	error,
}: LoadingStatePageProps) {
	useEffect(() => {
		if (error) {
			toast.error(error.message);
		}
	}, [error]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<div className="dark:bg-background bg-background/80 flex flex-col items-center justify-center p-8 text-center">
					{error ? (
						<div className="flex flex-col items-center space-y-4">
							<div className="dark:bg-destructive/20 bg-destructive/10 rounded-full p-4">
								<svg
									className={cn("h-8 w-8", "dark:text-destructive-foreground text-destructive")}
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
							</div>
							<h3 className={cn("text-lg font-medium", "dark:text-foreground text-foreground/90")}>{errorTitle}</h3>
							{errorDescription && (
								<p className={cn("text-sm", "dark:text-muted-foreground text-muted-foreground/80")}>
									{errorDescription}
								</p>
							)}
						</div>
					) : (
						<div className="flex flex-col items-center space-y-4">
							<Loader2 className={cn("h-8 w-8 animate-spin", "dark:text-primary-foreground text-primary")} />
							<h3 className={cn("text-lg font-medium", "dark:text-foreground text-foreground/90")}>{title}</h3>
							{description && (
								<p className={cn("text-sm", "dark:text-muted-foreground text-muted-foreground/80")}>{description}</p>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
