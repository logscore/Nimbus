import { cn } from "@/lib/utils";
import React from "react";

export const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
	({ className, ...props }, ref) => (
		<select
			ref={ref}
			className={cn(
				"border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
			{...props}
		/>
	)
);

Select.displayName = "Select";
