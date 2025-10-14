import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type BgAngelsProps = {
	className?: string;
	alt?: string;
} & ComponentProps<"div">;

export default function BgAngels({ className, alt }: BgAngelsProps) {
	return (
		<>
			<img
				src="/images/hero-dithered-black.png"
				alt={alt ? alt : "angel"}
				width={478}
				height={718}
				loading="eager"
				className={cn(className, "hidden dark:block")}
			/>
			<img
				src="/images/hero-dithered-white.png"
				alt={alt ? alt : "angel"}
				width={478}
				height={718}
				loading="eager"
				className={cn(className, "block dark:hidden")}
			/>
		</>
	);
}
