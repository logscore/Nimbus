import {
	Root,
	CollapsibleTrigger as CollapsibleTriggerPrimitive,
	CollapsibleContent as CollapsibleContentPrimitive,
} from "@radix-ui/react-collapsible";
import type { ComponentProps } from "react";

function Collapsible({ ...props }: ComponentProps<typeof Root>) {
	return <Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({ ...props }: ComponentProps<typeof CollapsibleTriggerPrimitive>) {
	return <CollapsibleTriggerPrimitive data-slot="collapsible-trigger" {...props} />;
}

function CollapsibleContent({ ...props }: ComponentProps<typeof CollapsibleContentPrimitive>) {
	return <CollapsibleContentPrimitive data-slot="collapsible-content" {...props} />;
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
