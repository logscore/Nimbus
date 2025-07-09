import { cn } from "@/lib/utils";

export interface HeaderTitleProps {
	title: string;
	description?: string;
	className?: string;
	titleClassName?: string;
	descriptionClassName?: string;
}

export function HeaderTitle({
	title,
	description,
	className = "",
	titleClassName = "",
	descriptionClassName = "",
}: HeaderTitleProps) {
	return (
		<div className={cn("ml-2", className)}>
			<h1 className={cn("text-lg font-semibold", titleClassName)}>{title}</h1>
			{description && <p className={cn("text-muted-foreground text-xs", descriptionClassName)}>{description}</p>}
		</div>
	);
}
