"use client";
import { Monitor } from "lucide-react";
import { LogoIcon } from "../icons";

export default function SmallScreenError() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-neutral-950 p-8">
			<div className="w-full max-w-2xl text-center">
				{/* Nimbus Branding */}
				<div className="absolute top-8 left-1/2 -translate-x-1/2">
					<div className="flex flex-col items-center">
						<LogoIcon className="h-9 w-9" />
						<span className="text-xl font-semibold text-white">Nimbus</span>
					</div>
				</div>

				{/* Desktop Icon */}
				<div className="mb-8">
					<div className="inline-flex rounded-full border border-dashed border-transparent bg-neutral-800/50 p-6">
						<Monitor className="h-12 w-12 text-blue-400" />
					</div>
				</div>

				{/* Main Message */}
				<div className="space-y-4">
					<h1 className="text-5xl leading-tight font-bold text-white md:text-6xl">Use desktop</h1>

					<p className="mx-auto max-w-lg text-lg text-neutral-400">
						Nimbus is optimized for the desktop experience.
						<br />
						Please use a desktop browser to experience the best of Nimbus.
					</p>
				</div>
			</div>
		</div>
	);
}
