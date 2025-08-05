import type { IconProps } from ".";

export function MicrosoftIcon({ className }: IconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 256 256"
			role="img"
			className={className}
		>
			<title>Microsoft</title>
			<rect x="0" y="0" width="121" height="121" fill="#F25022" />
			<rect x="135" y="0" width="121" height="121" fill="#7FBA00" />
			<rect x="0" y="135" width="121" height="121" fill="#00A4EF" />
			<rect x="135" y="135" width="121" height="121" fill="#FFB900" />
		</svg>
	);
}
