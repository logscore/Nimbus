import { LogoIcon } from "@/components/icons";
import Link from "next/link";

// this is a copy of Analogs footer component with some changes
// https://github.com/analogdotnow/Analog/blob/main/apps/web/src/components/footer.tsx

export default function Footer() {
	return (
		<footer className="flex w-full flex-row px-4 py-10 sm:px-6 sm:py-6 md:px-8 md:py-8">
			<div className="mx-auto flex w-full max-w-7xl flex-row items-center justify-center">
				<div className="text-muted-foreground flex flex-row items-center justify-center gap-2">
					<LogoIcon className="h-9 w-9" aria-hidden="true" />
					<Link
						href="https://nimbus.storage/terms"
						className="text-xs underline underline-offset-2 md:text-sm"
						aria-label="Terms of Use"
					>
						Terms of Use
					</Link>
					<Link
						href="https://nimbus.storage/privacy"
						className="text-xs underline underline-offset-2 md:text-sm"
						aria-label="Privacy Policy"
					>
						Privacy Policy
					</Link>
				</div>
			</div>
		</footer>
	);
}
