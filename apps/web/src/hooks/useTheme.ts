import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";

export const useTheme = () => {
	const { theme, setTheme } = useNextTheme();
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const toggleTheme = (): void => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return { theme, toggleTheme, isMounted };
};
