import * as React from "react";

import { cn } from "@/lib/utils";

interface LegalHeadingProps {
	children: React.ReactNode;
	className?: string;
}

export function LegalHeading1({ children, className }: LegalHeadingProps) {
	return <h1 className={cn("pb-4 text-4xl font-semibold md:text-6xl", className)}>{children}</h1>;
}

export function LegalHeading2({ children, className }: LegalHeadingProps) {
	return <h2 className={cn("pb-4 text-2xl font-semibold", className)}>{children}</h2>;
}

export function LegalHeading3({ children, className }: LegalHeadingProps) {
	return <h3 className={cn("pb-4 text-xl font-semibold", className)}>{children}</h3>;
}

interface LegalParagraphProps {
	children: React.ReactNode;
	className?: string;
}

export function LegalParagraph({ children, className }: LegalParagraphProps) {
	return <p className={cn("pb-4", className)}>{children}</p>;
}

interface LegalTextLinkProps {
	href: string;
	children: React.ReactNode;
	className?: string;
}

export function LegalTextLink({ href, children, className }: LegalTextLinkProps) {
	return (
		<a href={href} target="_blank" rel="noopener noreferrer" className={cn("text-primary hover:underline", className)}>
			{children}
		</a>
	);
}
