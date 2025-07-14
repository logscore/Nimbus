"use client";

import { forwardRef, type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const Table = forwardRef<
	HTMLTableElement,
	HTMLAttributes<HTMLTableElement> & {
		wrapperClassName?: string;
		tableLayout?: "auto" | "fixed";
	}
>(({ className, wrapperClassName, tableLayout = "auto", ...props }, ref) => (
	<div className={cn("w-full overflow-auto rounded-md border", wrapperClassName)}>
		<table
			ref={ref}
			className={cn(
				"w-full caption-bottom text-sm",
				{
					"table-auto": tableLayout === "auto",
					"table-fixed": tableLayout === "fixed",
				},
				className
			)}
			{...props}
		/>
	</div>
));
Table.displayName = "Table";

const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
	({ className, ...props }, ref) => (
		<thead
			ref={ref}
			className={cn("text-muted-foreground bg-muted/50 text-left text-xs font-medium", "[&_tr]:border-b", className)}
			{...props}
		/>
	)
);
TableHeader.displayName = "TableHeader";

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
	({ className, ...props }, ref) => (
		<tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
	)
);
TableBody.displayName = "TableBody";

const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
	({ className, ...props }, ref) => (
		<tfoot ref={ref} className={cn("bg-primary text-primary-foreground font-medium", className)} {...props} />
	)
);
TableFooter.displayName = "TableFooter";

const TableRow = forwardRef<
	HTMLTableRowElement,
	HTMLAttributes<HTMLTableRowElement> & {
		clickable?: boolean;
	}
>(({ className, clickable = false, ...props }, ref) => (
	<tr
		ref={ref}
		className={cn(
			"border-t transition-colors",
			{
				"hover:bg-muted/50 cursor-pointer": clickable,
				"hover:bg-muted/10": !clickable,
			},
			className
		)}
		{...props}
	/>
));
TableRow.displayName = "TableRow";

const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
	({ className, ...props }, ref) => (
		<th
			ref={ref}
			className={cn("p-3 text-left align-middle font-semibold [&:has([role=checkbox])]:pr-0", className)}
			{...props}
		/>
	)
);
TableHead.displayName = "TableHead";

const TableCell = forwardRef<
	HTMLTableCellElement,
	TdHTMLAttributes<HTMLTableCellElement> & {
		textMuted?: boolean;
	}
>(({ className, textMuted = false, ...props }, ref) => (
	<td
		ref={ref}
		className={cn(
			"p-3 align-middle [&:has([role=checkbox])]:pr-0",
			{
				"text-muted-foreground text-sm": textMuted,
			},
			className
		)}
		{...props}
	/>
));
TableCell.displayName = "TableCell";

const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
	({ className, ...props }, ref) => (
		<caption ref={ref} className={cn("text-muted-foreground mt-4 text-sm", className)} {...props} />
	)
);
TableCaption.displayName = "TableCaption";

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
