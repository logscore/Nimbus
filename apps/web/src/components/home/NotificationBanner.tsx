import { Link } from "@tanstack/react-router";

const WarningBanner = () => {
	return (
		<div className="flex items-center gap-3 rounded-2xl border-2 border-amber-600/40 bg-amber-900/20 p-4 text-amber-100">
			<span className="flex-shrink-0 text-xl">⚠️</span>
			<div className="text-sm">
				This project is not currently maintained. If you like what the project is and would like to see it continue,
				reach out on our{" "}
				<Link to="https://discord.gg/c9nWy26ubK" className="font-semibold underline">
					Discord
				</Link>
			</div>
		</div>
	);
};

export default WarningBanner;
