import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function SigninFormSkeleton() {
	return (
		<div className={cn("flex size-full flex-col items-center justify-center gap-0 select-none")}>
			<Card className="w-full max-w-md gap-6 pb-0">
				<CardHeader className="overflow-x-hidden">
					<div className="-mx-6 flex flex-row items-center justify-between border-b">
						<Skeleton className="my-3 ml-6 h-6 w-20" />
						<Skeleton className="my-3 mr-6 h-6 w-20" />
					</div>
					<div className="gap-2 pt-6">
						<Skeleton className="mx-auto mb-2 h-6 w-48" />
						<Skeleton className="mx-auto h-4 w-40" />
					</div>
				</CardHeader>
				<CardContent className="px-6">
					<div className="flex flex-col gap-4">
						<Skeleton className="h-9 w-full" />
						<Skeleton className="h-9 w-full" />
						<Skeleton className="mx-auto h-4 w-16" />
						<div className="space-y-2">
							<Skeleton className="mt-2 h-4 w-25" />
							<Skeleton className="h-9 w-full" />
						</div>
						<div className="space-y-2">
							<Skeleton className="mt-2 h-4 w-25" />
							<Skeleton className="h-9 w-full" />
						</div>
						<div className="flex justify-between">
							<Skeleton className="h-4 w-30" />
							<Skeleton className="h-4 w-30" />
						</div>
						<Skeleton className="h-9 w-full" />
					</div>
				</CardContent>
				<CardFooter className="px-6 py-4">
					<Skeleton className="mx-auto h-4 w-full" />
				</CardFooter>
			</Card>
		</div>
	);
}
