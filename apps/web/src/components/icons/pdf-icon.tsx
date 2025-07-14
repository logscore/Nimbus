import type { CSSProperties } from "react";

interface PdfIconProps {
	className?: string;
	size?: number;
	color?: string;
}

export function PdfIcon({ className = "h-4 w-4", size, color = "#9200fa" }: PdfIconProps) {
	const style: CSSProperties | undefined = size ? { width: size, height: size } : undefined;

	return (
		<svg
			viewBox="0 0 400 400"
			xmlns="http://www.w3.org/2000/svg"
			fill={color}
			stroke={color}
			className={className}
			style={style}
		>
			<g id="SVGRepo_bgCarrier" strokeWidth="0" />
			<g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
			<g id="SVGRepo_iconCarrier">
				<defs>
					<style>{`.cls-1{fill:${color};}`}</style>
				</defs>
				<title>PDF Document</title>
				<g id="xxx-word">
					<path className="cls-1" d="M325,105H250a5,5,0,0,1-5-5V25a5,5,0,0,1,10,0V95h70a5,5,0,0,1,0,10Z"></path>
					<path
						className="cls-1"
						d="M325,154.83a5,5,0,0,1-5-5V102.07L247.93,30H100A20,20,0,0,0,80,50v98.17a5,5,0,0,1-10,0V50a30,30,0,0,1,30-30H250a5,5,0,0,1,3.54,1.46l75,75A5,5,0,0,1,330,100v49.83A5,5,0,0,1,325,154.83Z"
					></path>
					<path
						className="cls-1"
						d="M300,380H100a30,30,0,0,1-30-30V275a5,5,0,0,1,10,0v75a20,20,0,0,0,20,20H300a20,20,0,0,0,20-20V275a5,5,0,0,1,10,0v75A30,30,0,0,1,300,380Z"
					></path>
					<path className="cls-1" d="M275,280H125a5,5,0,0,1,0-10H275a5,5,0,0,1,0,10Z"></path>
					<path className="cls-1" d="M200,330H125a5,5,0,0,1,0-10h75a5,5,0,0,1,0,10Z"></path>
					<path
						className="cls-1"
						d="M325,280H75a30,30,0,0,1-30-30V173.17a30,30,0,0,1,30-30h.2l250,1.66a30.09,30.09,0,0,1,29.81,30V250A30,30,0,0,1,325,280ZM75,153.17a20,20,0,0,0-20,20V250a20,20,0,0,0,20,20H325a20,20,0,0,0,20-20V174.83a20.06,20.06,0,0,0-19.88-20l-250-1.66Z"
					></path>
					<path
						className="cls-1"
						d="M145,236h-9.61V182.68h21.84q9.34,0,13.85,4.71a16.37,16.37,0,0,1-.37,22.95,17.49,17.49,0,0,1-12.38,4.53H145Zm0-29.37h11.37q4.45,0,6.8-2.19a7.58,7.58,0,0,0,2.34-5.82,8,8,0,0,0-2.17-5.62q-2.17-2.34-7.83-2.34H145Z"
					></path>
					<path
						className="cls-1"
						d="M183,236V182.68H202.7q10.9,0,17.5,7.71t6.6,19q0,11.33-6.8,18.95T200.55,236Zm9.88-7.85h8a14.36,14.36,0,0,0,10.94-4.84q4.49-4.84,4.49-14.41a21.91,21.91,0,0,0-3.93-13.22,12.22,12.22,0,0,0-10.37-5.41h-9.14Z"
					></path>
					<path className="cls-1" d="M245.59,236H235.7V182.68h33.71v8.24H245.59v14.57h18.75v8H245.59Z"></path>
				</g>
			</g>
		</svg>
	);
}
