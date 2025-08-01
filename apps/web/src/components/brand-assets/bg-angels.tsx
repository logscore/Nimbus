import HeroBgDark from "@/public/images/hero-dithered-black.png";
import HeroBgLight from "public/images/hero-dithered-white.png";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type BgAngelsProps = {
	className?: string;
	alt?: string;
} & ComponentProps<"div">;

export default function BgAngels({ className, alt }: BgAngelsProps) {
	return (
		<>
			<Image
				src={HeroBgDark}
				alt={alt ? alt : "angel"}
				width={478}
				height={718}
				loading="eager"
				className={cn(className, "hidden dark:block")}
				priority
			/>
			<Image
				src={HeroBgLight}
				alt={alt ? alt : "angel"}
				width={478}
				height={718}
				loading="eager"
				className={cn(className, "block dark:hidden")}
				priority
			/>
		</>
	);
}
