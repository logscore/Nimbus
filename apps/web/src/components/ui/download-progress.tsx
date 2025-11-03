import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface DownloadProgressProps {
	isDownloading: boolean;
	progress?: number; // 0-100
	fileName?: string;
	error?: string;
	onCancel?: () => void;
	className?: string;
	style?: React.CSSProperties;
}

export function DownloadProgress({
	isDownloading,
	progress = 0,
	fileName,
	error,
	onCancel,
	className,
	style,
}: DownloadProgressProps) {
	const [showProgress, setShowProgress] = useState(false);

	// Show progress bar after a short delay to avoid flashing for quick downloads
	useEffect(() => {
		if (isDownloading) {
			const timer = setTimeout(() => setShowProgress(true), 500);
			return () => clearTimeout(timer);
		} else {
			setShowProgress(false);
		}
	}, [isDownloading]);

	if (!isDownloading && !error) {
		return null;
	}

	return (
		<div
			className={cn("bg-background fixed right-4 bottom-4 z-50 w-80 rounded-lg border p-4 shadow-lg", className)}
			style={style}
		>
			<div className="flex items-center gap-3">
				{error ? (
					<XCircle className="text-destructive h-5 w-5" />
				) : progress === 100 ? (
					<CheckCircle className="h-5 w-5 text-green-500" />
				) : (
					<Loader2 className="text-primary h-5 w-5 animate-spin" />
				)}

				<div className="min-w-0 flex-1">
					<div className="flex items-center justify-between">
						<p className="truncate text-sm font-medium">{error ? "Download Failed" : fileName || "Downloading..."}</p>
						{isDownloading && onCancel && (
							<button
								onClick={onCancel}
								className="text-muted-foreground hover:text-foreground text-xs transition-colors"
							>
								Cancel
							</button>
						)}
					</div>

					{error ? (
						<p className="text-destructive mt-1 text-xs">{error}</p>
					) : (
						<div className="mt-2">
							{showProgress && <Progress value={progress} className="h-2" />}
							<p className="text-muted-foreground mt-1 text-xs">
								{progress === 100 ? "Download complete!" : `${Math.round(progress)}%`}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
