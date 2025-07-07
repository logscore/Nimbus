"use client";


import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { SegmentedProgress } from "@/components/ui/segmented-progress";
import { Skeleton } from "@/components/ui/skeleton";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function SignupFormSkeleton({ className, ...props }: ComponentProps<"div">) {
    return (
        <div className={cn("flex size-full flex-col items-center justify-center gap-0 select-none", className)} {...props}>
            <Card className="w-full max-w-md gap-6 pb-0">
                <CardHeader className="overflow-x-hidden">
                    <div className="-mx-6 flex flex-row items-center justify-start border-b">
                        <Skeleton className="my-3 h-6 ml-6 w-20" />
                    </div>
                    <SegmentedProgress segments={2} value={0} />
                    <div className="gap-2 pt-6">
                        <Skeleton className="h-6 w-48 mx-auto mb-2" />
                        <Skeleton className="h-4 w-40 mx-auto" />
                    </div>
                </CardHeader>
                <CardContent className="px-6">
                    <div className="flex flex-col gap-4">
                        <Skeleton className="h-10 w-full mb-2" />
                        <Skeleton className="h-10 w-full mb-2" />
                        <Skeleton className="h-4 w-16 mx-auto mb-2" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full mt-2" />
                        <Skeleton className="h-10 w-full mt-2" />
                    </div>
                </CardContent>
                <CardFooter className="px-6 py-4">
                    <Skeleton className="h-4 w-40 mx-auto" />
                </CardFooter>
            </Card>
        </div>
    );
}
