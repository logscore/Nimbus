// import HeroBgDark from "@/public/images/hero-dithered-black.png";
// import HeroBgLight from "public/images/hero-dithered-white.png";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { WaitlistForm } from "@/components/home/waitlist";
import HeroLight from "@/public/images/hero-light.png";
import HeroDark from "@/public/images/hero-dark.png";

// import { useIsMobile } from "@/hooks/use-mobile";
import Header from "@/components/home/header";
import { type Variants } from "motion/react";
import Image from "next/image";
import Footer from "./footer";

const transitionVariants: { item: Variants } = {
	item: {
		hidden: {
			opacity: 0,
			y: 12,
		},
		visible: {
			opacity: 1,
			filter: "blur(0px)",
			y: 0,
			transition: {
				type: "spring",
				bounce: 0.3,
				duration: 1.5,
			},
		},
	},
};

export default function Hero() {
	// const isMobile = useIsMobile();

	return (
		<div className="font-manrope flex w-full flex-1 flex-col items-center justify-center gap-12 overflow-hidden px-4 py-40 md:gap-16">
			<Header />
			<AnimatedGroup variants={transitionVariants} className="w-full">
				<div className="relative flex w-full flex-col gap-12 px-4 md:px-6">
					{/* Removed these for page-load performance
					{isMobile && (
						<>
							<Image
								src={HeroBgDark}
								alt="hero bg"
								width={478}
								height={718}
								className="pointer-events-none absolute -top-40 left-40 z-0 hidden h-auto rotate-12 opacity-50 dark:block"
								priority
							/>
							<Image
								src={HeroBgLight}
								alt="hero bg"
								width={478}
								height={718}
								className="pointer-events-none absolute -top-40 left-40 z-0 block h-auto rotate-12 opacity-50 dark:hidden"
								priority
							/>
						</>
					)} */}

					<div className="relative mx-auto w-full max-w-3xl sm:max-w-4xl md:max-w-5xl lg:max-w-6xl">
						<div className="pointer-events-none absolute top-1/2 left-1/2 z-0 block h-[60vw] w-[120vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.7)_60%,rgba(255,255,255,0.2)_100%)] blur-[100px] sm:h-[80%] sm:w-[120%] dark:hidden" />

						<div className="pointer-events-none absolute top-1/2 left-1/2 z-0 hidden h-[60vw] w-[120vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(10,10,20,0.7)_60%,rgba(10,10,20,0.2)_100%)] blur-[100px] sm:h-[80%] sm:w-[120%] dark:block" />

						{/* Removed these for page-load performance
						<div className="absolute bottom-[-100%] left-[-100px] z-0 hidden sm:block">
							<Image
								src={HeroBgDark}
								alt="angel left"
								width={386}
								height={579}
								className="hidden scale-x-[-1] -rotate-12 opacity-40 dark:block"
								priority
							/>
							<Image
								src={HeroBgLight}
								alt="angel left"
								width={386}
								height={579}
								className="block scale-x-[-1] -rotate-12 opacity-60 dark:hidden"
								priority
							/>
						</div>

						<div className="absolute right-[-100px] bottom-[-100%] z-0 hidden sm:block">
							<Image
								src={HeroBgDark}
								alt="angel right"
								width={386}
								height={579}
								className="hidden rotate-12 opacity-40 dark:block"
								priority
							/>
							<Image
								src={HeroBgLight}
								alt="angel right"
								width={386}
								height={579}
								className="block rotate-12 opacity-60 dark:hidden"
								priority
							/>
						</div> */}

						<div className="relative z-10 flex flex-col items-center justify-center gap-8 text-center md:gap-12 lg:gap-12">
							<h1 className="text-4xl leading-[1.1] font-bold tracking-[-0.02em] sm:flex-row md:text-6xl lg:text-7xl">
								Cloud you <br /> can actually{" "}
								<span className="bg-gradient-to-br from-black to-white/5 bg-clip-text text-transparent dark:from-white dark:to-black/5">
									trust.
								</span>
							</h1>
							<p className="mx-auto max-w-xs text-sm leading-tight sm:text-[16px]">
								{`Take charge of your files with a cloud that's open, secure, and built for you.`}
							</p>
						</div>
					</div>
					<WaitlistForm />
				</div>
			</AnimatedGroup>

			<AnimatedGroup
				variants={{
					container: {
						visible: {
							transition: {
								staggerChildren: 0.05,
								delayChildren: 0.25,
							},
						},
					},
					...transitionVariants,
				}}
			>
				<div className="border-border mx-auto w-full max-w-3xl rounded-xl border bg-gray-50/5 p-2 backdrop-blur-xs sm:max-w-4xl sm:min-w-0 sm:translate-x-0">
					<div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-black to-[#7FBEE4] opacity-30 blur-[60px]" />
					<Image
						src={HeroDark}
						alt="Hero"
						className="z-10 ml-0 hidden h-auto w-full rounded-lg object-cover sm:mx-auto dark:block"
						unoptimized
						sizes="(max-width: 768px) 100vw, 80vw"
					/>
					<Image
						src={HeroLight}
						alt="Hero"
						className="z-10 ml-0 block h-auto w-full rounded-lg object-cover sm:mx-auto dark:hidden"
						unoptimized
						sizes="(max-width: 768px) 100vw, 80vw"
					/>
				</div>
			</AnimatedGroup>
			<Footer />
		</div>
	);
}
