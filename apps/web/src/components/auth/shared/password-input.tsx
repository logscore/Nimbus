import type { PasswordInputProps } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";

export function PasswordInput({ className, ...props }: PasswordInputProps) {
	const [isVisible, setIsVisible] = useState(false);

	const toggleVisibility = () => setIsVisible(!isVisible);

	return (
		<div className="relative">
			<Input type={isVisible ? "text" : "password"} className={className} {...props} />
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent disabled:pointer-events-none"
				onClick={toggleVisibility}
				aria-label={isVisible ? "Hide password" : "Show password"}
			>
				{isVisible ? <EyeClosed className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
			</Button>
		</div>
	);
}
