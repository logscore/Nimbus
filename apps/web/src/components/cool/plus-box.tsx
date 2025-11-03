import { Plus } from "lucide-react";
import { useState } from "react";

// I saw this on twitter and wanted to recreate it. Ill probably remove it with something cooler and less toy-like later.

const PlusGrid = () => {
	const cols = 15;
	const rows = 5;
	const total = cols * rows;

	return (
		<div
			className="grid h-full w-full"
			style={{
				gridTemplateColumns: `repeat(${cols}, 1fr)`,
				gridTemplateRows: `repeat(${rows}, 1fr)`,
				gap: "4px",
			}}
		>
			{Array.from({ length: total }).map((_, i) => (
				<HoverPlus key={i} />
			))}
		</div>
	);
};

const HoverPlus = () => {
	const [isHovered, setHovered] = useState(false);

	const handleEnter = () => setHovered(true);
	const handleLeave = () => setTimeout(() => setHovered(false), 500);

	return (
		<div
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
			className={`flex transform items-center justify-center transition-transform duration-300 ease-out ${
				isHovered ? "scale-105 rotate-45 text-orange-400" : "scale-100 rotate-0 text-gray-500"
			}`}
			style={{
				width: "100%",
				height: "100%",
				aspectRatio: "1 / 1", // ensures perfect squares, avoids vertical overflow
			}}
		>
			{/* icon scales automatically with container */}
			<Plus className="h-[70%] w-[70%]" strokeWidth={3} />
		</div>
	);
};

export default PlusGrid;
